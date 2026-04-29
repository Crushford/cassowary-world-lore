# Repository Structure

This document explains where Cassowary World material belongs and how the top-level folders should be used.

## Source of Truth

Markdown in this repository defines canon. Other applications may render or consume the material, but source Markdown remains authoritative.

Canon-bearing material belongs in foundation files, `reference/`, `lore/divergences/`, `lore/`, or generated timeline views. Stories can demonstrate events and perspective; durable world mechanics should also be reflected in reference, divergence, or lore docs.

## Top-Level Layout

- Root `*.md` files contain stable foundation canon, project-level references, canon indexes, and open questions.
- `docs/` contains contributor-facing instructions, repository maintenance guidance, and process documentation.
- `principles/` is a navigation layer for project philosophy and canon constraints.
- `reference/` contains real-world baseline and world-state documents.
- `lore/` contains Cassowary World systems and fundamental divergences.
- `stories/` contains non-canon exploratory narrative material and spikes.
- `generated/` contains committed deterministic indexes derived from source docs.
- `tools/` contains repository maintenance scripts.
- `.github/workflows/` contains CI that validates generated files.

## Foundation and Authority Documents

The current foundation and authority documents are:

- [Guiding Principles](guiding-principles.md)
- [Core Logic](core-logic.md)
- [Canon Index](../generated/canon-index.md)
- [Open Questions](../generated/open-questions.md)
- [Timeline Overview](../generated/timeline-overview.md)

Generated authority views are rebuilt from source docs. Keep source metadata, atomic notes, related documents, and open-question sections current instead of editing generated views manually.

## Active Knowledge Layers

`reference/` defines real-world baseline and world-state constraints. Reference docs are not Cassowary World canon by themselves.

`lore/divergences/` defines deliberate changes from real-world history or biology. Each major divergence should have one canonical file.

`lore/` defines Cassowary World systems that emerge from baseline reality plus divergences. System docs should explain mechanisms, constraints, consequences, institutions, technologies, and cultural processes.

### Lore Subfolders

Place a lore file in the subfolder that matches its primary subject domain:

- `divergences/` — deliberate changes from real-world history or biology (one file per major divergence)
- `biology/` — species-level biological mechanisms (anatomy, neurology, behaviour)
- `ecology/` — ecological systems and inter-species interactions
- `agriculture/` — domestication, cultivation, and orchard management
- `infrastructure/` — physical technology: storage, ceramics, construction
- `transport/` — movement networks and load-carrying systems
- `frameworks/` — analytical or classification models used to understand the world
- `honeypot-ants/` — content specific to honeypot ant biology, behaviour, or management
- `tribute/` — political economy: tribute collection, custody, redistribution, and authority

If a topic spans multiple domains, place the file where its *primary mechanism* lives and link to the other relevant folders from the `Related Documents` section.

A new subfolder is appropriate when a topic is large enough to warrant its own domain and won't fit cleanly into an existing one. Before creating one, check whether an existing subfolder covers it. If you do add a subfolder, update the list above so the guidance stays current.

`stories/` stores scenes and narrative spikes. If story material introduces a durable world mechanic, extract it into a system doc or open question so generated reference views can surface it.

## Folder READMEs

Folder READMEs are local navigation pages. Keep them short and useful for browsing.

Do not place durable process rules only in folder READMEs. Move durable contributor guidance into `docs/` and link to it from folder READMEs when needed.

## Canon Inclusion

Committed source documents are treated as confirmed repository knowledge. The repository no longer uses draft/candidate categories.

[Canon Index](../generated/canon-index.md) is generated from source document layers. Keep layer metadata, topics, time periods, related documents, atomic notes, and open questions current so the generated views remain useful.

## Working Style

- Use `reference/` for real-world baseline, `lore/` for Cassowary World systems, and `stories/` for narrative exploration.
- Add dependency, timeline, and related-document links to lore docs where relevant.
- Keep `generated/` committed and in sync with source docs.
- Prefer updating existing files over creating broad duplicate summaries.
- Use clear headings and structured Markdown.
