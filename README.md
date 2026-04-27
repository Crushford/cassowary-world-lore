# Cassowary World Lore

This repository is the documentation and canon foundation for the **Cassowary World** project.

It is organized as a layered causal knowledge base: real-world reference defines the baseline, divergences define what changes, lore explains what emerges, and stories demonstrate systems without defining canon.

## Purpose

- Store canon and story foundation notes for the Cassowary World
- Preserve causal explanations for biological, ecological, technical, and institutional systems
- Make canon status and system dependencies easier to audit and maintain

## Repository Structure

- `principles/` - navigation for guiding philosophy and canon constraints
- `docs/` - navigation for contributor-facing instructions and migration guides
- `reference/` - real-world baseline and world-state documents
- `lore/` - retrievable Cassowary World system docs and fundamental divergences
- `stories/` - non-canon exploratory narrative material and spikes
- Root `*.md` files - foundation documents, canon index, open questions, and stable project-level references
- `README.md` - repository overview
- `AGENTS.md` - operating instructions for human/AI contributors

## Current Foundation Docs

- `00-world-overview.md`
- `01-regions-and-places.md`
- `02-people-cultures-and-factions.md`
- `03-history-and-timeline.md`
- `04-rules-of-the-world.md`
- `05-story-foundation.md`
- `GUIDING_PRINCIPLES.md`
- `CORE_LOGIC.md`
- `CANON_INDEX.md`
- `99-open-questions.md`

## Active Knowledge Layers

Active canon and canon candidates live in `reference/`, `lore/divergences/`, and `lore/`.

`reference/` defines real-world baseline and world-state constraints. `lore/divergences/` defines deliberate changes from real-world history or biology. `lore/` defines the Cassowary World systems that emerge from those constraints and divergences.

## Core Logic

`CORE_LOGIC.md` is the inference layer for repository consistency. It captures causal rules and dependency expectations (for example, preservation implies storage infrastructure; storage infrastructure implies ownership and institutional handling).

Lore documents should be checked against `CORE_LOGIC.md` to identify missing dependencies, contradictions, or required open questions.

## Canon Promotion

Canon status progresses through documented review, not narrative assertion.

- `Draft` - exploratory, incomplete, or provisional
- `Canon Candidate` - mechanistically defined and plausibly integrated
- `Canon` - explicitly confirmed
- `Deprecated` - retained for traceability but no longer active canon

Active reference and lore systems should be tracked in `CANON_INDEX.md`.

## Working Style

- Keep root foundation docs stable until specific migration passes justify edits
- Use `reference/` for real-world baseline, `lore/` for Cassowary World systems, and `stories/` for narrative exploration
- Add dependency, timeline, and related-document links to lore docs where relevant
- Prefer updating existing files over creating many new ones
- Use clear headings and structured Markdown
