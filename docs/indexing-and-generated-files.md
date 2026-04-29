# Indexing and Generated Files

This repository commits generated Markdown indexes so canon, reference, lore, story, status, open-question, summary, topic, and time-period views are easy to inspect.

## Generated Directory

`generated/` contains deterministic Markdown views derived from hand-authored source docs.

Core generated views include:

- `generated/content-index.md`
- `generated/canon-index.md`
- `generated/open-questions.md`
- `generated/timeline-overview.md`
- `generated/validation-report.md`
- `generated/topics.md`
- `generated/layers/`
- `generated/status/`
- `generated/time/`
- `generated/summaries/`

Do not hand-edit generated files. Update source docs or the generator, then regenerate.

Do not manually maintain [Canon Index](../generated/canon-index.md), [Open Questions](../generated/open-questions.md), or [Timeline Overview](../generated/timeline-overview.md). These files are generated views.

## Generator

The generator lives at [tools/generate-indexes.ts](../tools/generate-indexes.ts).

It scans:

- `reference/`
- `lore/`
- `stories/`
- an explicit allowlist of root foundation documents

It intentionally skips folder `README.md` files so local navigation pages do not become canon index entries.

Contributor docs under `docs/` are not indexed as canon content by default. If a contributor doc needs to become an indexed foundation document, add it intentionally and update this guidance.

## Source Doc Responsibilities

New content PRs should update source docs, then run the generator.

- Canon status belongs in source doc `Status` metadata, not only in a manual index.
- Timeline data belongs in source doc `Time periods` metadata, not in a manual timeline.
- Open questions belong in source doc `## Open Questions` sections, not in a manual global list.
- Summaries, atomic notes, related documents, topics, regions, and cultures should be maintained in source docs so generated views stay useful.

If generated output is wrong, fix the source doc metadata or fix the generator.

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
