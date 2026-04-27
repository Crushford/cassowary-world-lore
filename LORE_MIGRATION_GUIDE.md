# Cassowary World Lore Migration Guide

Status: Draft

## Goal

Migrate the Cassowary World lore repository from broad technical documents into smaller, clearer, more reusable lore files.

The new structure should make the lore:

- easier to read
- easier to search
- easier to filter by time period, topic, culture, and region
- easier for an LLM to use without pulling in irrelevant context
- easier to expand without turning into a tangled knowledge base

Markdown in Git remains the source of truth.

Do not convert lore files to JSON. Generated indexes may later be created from Markdown, but Markdown remains the human-editable canon layer.

## Layer Model

The repository separates four kinds of information.

Layer rule:

- The real world is the baseline.
- The world-state defines the stage.
- Divergences define what changes.
- Lore defines what emerges.

All new content must fit into one of these layers.

### Layer 1: Real-World Reference

`reference/` stores information that is true in the real world.

Examples include cassowary biology, honeypot ant biology, aphid-ant relationships, cockatoo intelligence, Sahul geography, and Pleistocene climate.

This layer is background context. It is not Cassowary World canon by itself.

Reference docs should not contain invented Cassowary World changes. They should summarize only the baseline facts useful for understanding the lore.

### Layer 2: Fundamental Divergences

`lore/divergences/` stores the small number of deliberate differences from real-world history or biology.

Each major divergence should have one canonical file. Do not duplicate divergence explanations across many system docs. If a new divergence seems necessary, add it as a proposed divergence or open question first.

Current divergence files should track:

- cassowary wing-claw development
- honeypot ant nest splitting
- moa ridability, currently undefined

### Layer 3: Cassowary World Systems

`lore/` stores the main Cassowary World system layer.

System docs explain what emerges from real-world baseline facts plus the fundamental divergences. They should focus on what is different in Cassowary World: mechanisms, constraints, consequences, institutions, technologies, and cultural systems.

Pure real-world facts should move to reference docs or brief context. Atomic notes in system docs should answer: "What is true in Cassowary World?"

### Layer 4: Story Layer

`stories/` stores narrative material.

Stories demonstrate how systems work in lived reality. They do not define canon by themselves. If story material introduces a useful world fact, extract it into a system doc or open question before treating it as canon.

### Retained Source Layer

`technical-documents/` remains retained source material during migration.

Technical documents preserve the original mechanism writeups, audit trail, and source context. Early migration passes should not delete, rename, or substantially rewrite source technical documents. When a source document is piloted, add only a brief migration note that links to the new focused lore files.

Root foundation documents should remain overview, navigation, or framework documents unless they contain substantive canon that needs later migration.

## Top-Level Navigation

- `principles/` links to project philosophy and canon constraints such as `GUIDING_PRINCIPLES.md` and `CORE_LOGIC.md`.
- `docs/` links to contributor-facing documentation such as `AGENTS.md` and this guide.
- `reference/` contains real-world baseline and world-state documents.
- `lore/` contains Cassowary World systems and fundamental divergences.
- `stories/` contains non-canon narrative material.
- `technical-documents/` remains retained source material and audit history during migration.

## Core Concept

Each lore file should explain one focused idea.

A file should not try to explain everything about a broad subject. It should explain a smaller idea, such as:

- cockatoo ownership in the WTA
- cockatoo and cassowary cooperation
- honeypot ant harvesting
- sealed-vessel tribute
- glacial geography during the main story period

The file can still link to broader topics, but it should have one clear reason to exist.

## Writing From Constraints

Before writing or migrating a Cassowary World system doc, identify:

- which world-state constraints apply
- which fundamental divergences apply
- what pressure the system responds to
- what the system changes or enables

Prefer causal chains:

condition -> action -> consequence

Example:

patchy ecology -> localized production -> decentralized storage

All lore systems must assume the world-state unless explicitly overridden by a specific local or temporal variation.

Do not restate the world-state baseline inside every system doc. Link to reference docs, especially [World State — ~2 MYA (Representative Glacial Maximum)](reference/world-state-2mya.md), when geography, climate, species, or ecological constraints matter.

System docs should make implications clear: what does this force the world to look like?

## Storage Principle

Folders are for human browsing.

Metadata is for search and retrieval.

A file should live in the folder that best matches its main topic, but it may be tagged with several topics, cultures, regions, and time periods.

Do not duplicate the same lore in multiple folders. Use links and metadata instead.

## File Naming

Use the pattern:

`primary-subject-specific-concept.md`

Start filenames with the primary subject whenever possible. This keeps folder listings scannable and prevents related files from drifting apart.

Examples:

- `honeypot-ant-harvesting.md`
- `honeypot-ant-sugar-preservation.md`
- `tribute-sealed-vessel-units.md`

## Recommended File Shape

Each migrated lore file should use this Markdown structure:

1. `# Title`
2. `## Summary`
3. `## Metadata`
4. `## Atomic Notes`
5. `## Context`
6. `## Open Questions`
7. `## Related Documents`

If a section has no content, either omit it or include a short note explaining that there are no known open questions yet.

### Title

The title should clearly say what the file explains.

Good titles:

- Cockatoo Ownership in the WTA
- Cockatoo and Cassowary Cooperation
- Honeypot Ant Harvesting
- Sealed-Vessel Tribute
- Glacial Geography During the Main Story Period

Bad titles:

- Cockatoos
- Culture
- Trade Stuff
- Random Ecology Notes

### Summary

The summary should briefly explain what the file is about.

It should answer: "What does this document explain?"

Keep the summary short and useful. A few sentences is enough.

### Metadata

The metadata section describes how the file should be found.

Use readable Markdown bullets with consistent labels.

Every file should identify supported values for:

- Layer
- Primary topic
- Topics
- Time periods
- Regions
- Status

Include `Cultures` only when a specific culture or society is supported by the source material. Omit unsupported metadata fields instead of filling them with placeholder values.

Optional metadata may include:

- Related species
- Related institutions
- Related technologies
- Related documents
- Source documents

Do not invent near-duplicate tags. Pick clear reusable labels.

## Allowed Time Labels

Time labels are controlled metadata values. Do not invent new time labels casually.

Initial allowed labels:

- `20-25 MYA`
- `~6-4 MYA`
- `4-3 MYA`
- `~3-2.5 MYA`
- `~2.5-2 MYA`
- `~2 MYA`
- `~3.2-2.8 MYA`
- `~2.7-2.3 MYA`
- `~2.2-1.8 MYA`
- `early Pleistocene glacial cycles`
- `~2 MYA representative glacial maximum`

If a migration requires a new time label, add it to this section and mention it in the migration summary.

Time labels are retrieval filters, not perfect scientific periodization. Preserve narrower source dates in context or source documents when needed, but use only allowed labels in metadata. Time should be handled through metadata, not folders. If a file applies to more than one period, include each relevant period in metadata.

### Atomic Notes

Atomic notes are the main canon-bearing content in Cassowary World system docs.

An atomic note is one self-contained statement about how Cassowary World works.

Atomic means one meaningful idea, not one sentence. Prefer mechanisms over lists, general rules over examples, and useful concept compression over procedural breakdown.

Atomic notes should usually not state pure real-world baseline facts. Put baseline biology, ecology, geography, and climate in `reference/` docs unless the note directly explains a Cassowary World mechanism.

Good examples:

- Cockatoos in WTA households are commonly inherited through family lines.
- A trained cockatoo can function as both a signalling partner and a household status object.
- Cockatoo ownership in the WTA is shaped by broader household property customs.
- Cassowary orchard management stabilizes aphid populations to increase predictable honeydew availability for managed honeypot ant colonies.

Bad example:

- Cockatoos are important to WTA culture, trade, inheritance, communication, and status.
- Aphids produce honeydew.

If a note contains several ideas, split it.

Do not mechanically explode closely related variants into separate bullets when the grouped variant is the useful fact. Atomic notes should read as clear, reusable facts, not procedural inventories.

Delete or merge notes that are technically true but too low-value to help retrieval or reasoning.

Prefer:

- Tribute intake practices sort, count, and arrange vessels by visible type, size, seal status, and storage position.

Avoid:

- Vessels are counted by visible type.
- Vessels are sorted by visible type.
- Vessels are counted by seal status.
- Vessels are sorted by seal status.

During tightening passes:

- remove repeated concepts
- merge list explosions
- replace vague notes with mechanism-level statements
- confirm each summary answers the file's retrieval question
- confirm context states what the file depends on and enables
- check time labels against the allowed list

### Context

The context section explains the idea in a more natural way.

Use this section for:

- background explanation
- why the system exists
- how it fits into the wider world
- how it relates to other systems

Do not hide new canon facts only in the context section. If a fact matters, it should also appear as an atomic note.

### Open Questions

Use this section for unresolved issues.

Open questions prevent uncertain ideas from accidentally becoming canon.

### Related Documents

List related files.

Related documents should include:

- direct dependencies
- neighbouring systems
- overlapping topics
- likely contradiction points

Use Markdown links.

## Atomic Does Not Mean Tiny

Atomic does not mean one sentence per file.

Atomic means one clear idea.

A file can contain multiple atomic notes if they all support the same focused topic.

Avoid both extremes:

- one giant file for all lore about a broad subject
- one microscopic file per sentence

## When to Split a File

Split a file when it starts answering multiple separate questions.

A file should probably be split if:

- it covers several different time periods in unrelated ways
- it covers several different cultures or regions with different rules
- it mixes biology, institution, culture, and economy without a clear centre
- the atomic notes no longer feel like they belong to one idea
- retrieval would often need only one small part of the file

Do not split just for neatness. Split when it improves retrieval, clarity, or future editing.

## Where to Store Multi-Topic Files

Some lore belongs to more than one topic.

Choose the physical location based on the main thing being explained.

If the file explains a species, store it under that species or species group. If it explains property law, store it under the relevant culture or institution. If it explains ownership as a general system, store it under institutions.

Then use metadata to connect it to the other topics.

## Indexing Principle

Indexes should eventually be generated from Markdown.

The Markdown files should be structured consistently enough that scripts can extract:

- title
- summary
- metadata
- headings
- atomic notes
- related documents

Generated indexes may include:

- topic indexes
- time period indexes
- culture indexes
- region indexes
- status indexes

These indexes should help an LLM decide what context to load before answering or editing.

## Migration Strategy

Do not migrate the whole repository in one pass.

Work in stages. Preserve meaning while improving structure.

Do not rewrite lore aggressively. Do not invent new canon. Do not silently promote speculative material to canon.

Suggested order:

1. ecology and biology documents
2. agriculture and infrastructure documents
3. institutions documents
4. frameworks documents
5. root foundation documents
6. indexes and overview pages

## Related Information Rule

When migrating a file, do not treat it as isolated.

Before writing the final migrated version, inspect likely related files. The goal is not to migrate all related files immediately. The goal is to avoid writing the new file without awareness of direct dependencies, overlaps, or contradiction points.

If related files are not migrated yet, still link them or mention them as future review targets.

## Stories

Stories are not canon by themselves.

Do not migrate story material into canon unless explicitly instructed.

If story material contains useful assumptions, list them as candidate ideas or open questions, not accepted canon.

## Migration Output

For each migration batch, provide:

- files inspected
- files changed
- new files created
- files split or renamed
- metadata labels used
- new metadata labels proposed
- related files noticed but not migrated
- possible contradictions or unresolved questions
- recommended next migration batch

## Success Criteria

The migration is successful if:

- each new file has one clear purpose
- each file can be found by topic, time period, culture, and region where supported
- important facts are visible as atomic notes
- explanatory context remains readable
- related documents are linked
- unresolved issues are preserved
- the repo is easier to query without bloating LLM context
- no canon meaning is silently changed
