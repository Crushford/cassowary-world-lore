# Cassowary World Lore

This repository is the documentation and canon foundation for the **Cassowary World** project.

It is organized as a causal knowledge base: technical documents explain how systems work, what they depend on, and what they enable.

## Purpose

- Store canon and story foundation notes for the Cassowary World
- Preserve causal explanations for biological, ecological, technical, and institutional systems
- Make canon status and system dependencies easier to audit and maintain

## Repository Structure

- Root `*.md` files - foundation documents, guiding principles, canon index, and repository-level references
- `technical-documents/` - technical lore pages organized by category (`biology/`, `ecology/`, `agriculture/`, `infrastructure/`, `institutions/`, `frameworks/`)
- `stories/` - non-canon exploratory narrative material and spikes
- `README.md` - repository overview (this file)
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

## Technical Documents

Technical documents are subject-focused reference pages used to explain how a specific feature of the world works, when it emerges, what constrains it, and which downstream systems it enables.

See `technical-documents/README.md` for category definitions, required sections, and canon-promotion workflow.

## Core Logic

`CORE_LOGIC.md` is the inference layer for repository consistency. It captures causal rules and dependency expectations (for example, preservation implies storage infrastructure; storage infrastructure implies ownership and institutional handling).

Technical documents should be checked against `CORE_LOGIC.md` to identify missing dependencies, contradictions, or required placeholder documents.

## Canon Promotion

Canon status progresses through documented review, not narrative assertion.

- `Draft` - exploratory, incomplete, or provisional
- `Canon Candidate` - mechanistically defined and plausibly integrated
- `Canon` - explicitly confirmed
- `Deprecated` - retained for traceability but no longer active canon

Technical systems should be tracked in `CANON_INDEX.md`.

## Working Style

- Keep core world/canon docs at the repository root
- Put subject-specific technical reference pages in the appropriate `technical-documents/` category folder
- Add dependency and timeline sections to technical docs
- Prefer updating existing files over creating many new ones
- Use clear headings and structured Markdown
