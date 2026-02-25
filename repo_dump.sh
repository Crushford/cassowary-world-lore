#!/usr/bin/env bash

set -euo pipefail

show_help() {
  cat <<'EOF'
Usage: ./repo_dump.sh [--md-only] [REPO_PATH]

Prints a snapshot of a repository to stdout with:
1) a structure listing (directories + files)
2) the full contents of each file

Notes:
- Excludes .git/ by default.
- `--md-only` limits output to Markdown files (`*.md`) and their parent directories.
- Output is plain text and can be redirected to a file.

Examples:
  ./repo_dump.sh
  ./repo_dump.sh --md-only
  ./repo_dump.sh . > repo-snapshot.txt
  ./repo_dump.sh --md-only . > markdown-snapshot.txt
  ./repo_dump.sh "/path/to/repo" > repo-snapshot.txt
EOF
}

markdown_only=0
repo_path=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      exit 0
      ;;
    --md-only|--markdown-only)
      markdown_only=1
      shift
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "Error: unknown option '$1'." >&2
      exit 1
      ;;
    *)
      if [[ -n "$repo_path" ]]; then
        echo "Error: only one REPO_PATH may be provided." >&2
        exit 1
      fi
      repo_path="$1"
      shift
      ;;
  esac
done

if [[ -z "$repo_path" ]]; then
  repo_path="."
fi

if [[ ! -d "$repo_path" ]]; then
  echo "Error: '$repo_path' is not a directory." >&2
  exit 1
fi

tmp_structure="$(mktemp)"
tmp_files="$(mktemp)"

cleanup() {
  rm -f "$tmp_structure" "$tmp_files"
}
trap cleanup EXIT

repo_abs="$(cd "$repo_path" && pwd)"

(
  cd "$repo_abs"

  if [[ "$markdown_only" -eq 1 ]]; then
    # Markdown files only.
    find . -path './.git' -prune -o -type f -name '*.md' -print \
      | sed 's|^\./||' \
      | awk 'NF' \
      | LC_ALL=C sort > "$tmp_files"

    # Build a minimal structure list containing markdown files and their parent dirs.
    {
      printf '.\n'
      while IFS= read -r relpath; do
        [[ -n "$relpath" ]] || continue
        printf '%s\n' "$relpath"

        dir_path="$(dirname "$relpath")"
        while [[ "$dir_path" != "." && "$dir_path" != "/" ]]; do
          printf '%s\n' "$dir_path"
          next_dir="$(dirname "$dir_path")"
          [[ "$next_dir" != "$dir_path" ]] || break
          dir_path="$next_dir"
        done
      done < "$tmp_files"
    } | LC_ALL=C sort -u > "$tmp_structure"
  else
    # Repo structure (dirs + files), excluding .git internals.
    find . -path './.git' -prune -o -print \
      | sed 's|^\./||' \
      | awk 'NF' \
      | LC_ALL=C sort > "$tmp_structure"

    # File list only, used for content dump.
    find . -path './.git' -prune -o -type f -print \
      | sed 's|^\./||' \
      | awk 'NF' \
      | LC_ALL=C sort > "$tmp_files"
  fi
)

printf 'REPO SNAPSHOT\n'
printf 'ROOT: %s\n' "$repo_abs"
printf 'GENERATED_UTC: %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
if [[ "$markdown_only" -eq 1 ]]; then
  printf 'MODE: markdown-only (*.md)\n'
else
  printf 'MODE: all files\n'
fi
printf '\n'

printf '===== STRUCTURE =====\n'
while IFS= read -r entry; do
  printf '%s\n' "$entry"
done < "$tmp_structure"
printf '===== END STRUCTURE =====\n'

printf '\n'
printf '===== FILE CONTENTS =====\n'
while IFS= read -r relpath; do
  printf '\n'
  printf -- '----- BEGIN FILE: %s -----\n' "$relpath"
  cat "$repo_abs/$relpath"

  # Ensure a clean separator even if the file has no trailing newline.
  last_char="$(tail -c 1 "$repo_abs/$relpath" 2>/dev/null || true)"
  if [[ -n "$last_char" ]]; then
    printf '\n'
  fi

  printf -- '----- END FILE: %s -----\n' "$relpath"
done < "$tmp_files"
printf '\n'
printf '===== END FILE CONTENTS =====\n'
