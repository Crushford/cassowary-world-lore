# Indexing and Generated Files

This repository commits generated Markdown indexes so canon, reference, lore, story, status, topic, and time-period views are easy to inspect.

## Generated Directory

`generated/` contains deterministic Markdown views derived from hand-authored source docs.

Core generated views include:

- `generated/content-index.md`
- `generated/validation-report.md`
- `generated/orphans.md`
- `generated/topics.md`
- `generated/layers/`
- `generated/status/`
- `generated/time/`

Do not hand-edit generated files. Update source docs or the generator, then regenerate.

## Generator

The generator lives at [tools/generate-indexes.ts](../tools/generate-indexes.ts).

It scans:

- `reference/`
- `lore/`
- `stories/`
- an explicit allowlist of root foundation documents

It intentionally skips folder `README.md` files so local navigation pages do not become canon index entries.

Contributor docs under `docs/` are not indexed as canon content by default. If a contributor doc needs to become an indexed foundation document, add it intentionally and update this guidance.

## Commands

Regenerate committed indexes:

```sh
npm run generate:indexes
```

Check that committed indexes are current:

```sh
npm run generate:indexes:check
```

## CI

[generate-indexes.yml](../.github/workflows/generate-indexes.yml) runs on pull requests and pushes to `main`.

The workflow:

1. installs Node
2. installs dependencies
3. runs `npm run generate:indexes`
4. fails if `generated/` has uncommitted differences

## Validation

Review `generated/validation-report.md` after structural changes. It highlights missing summaries, invalid metadata labels, stale generated files, and other indexable documentation issues.
