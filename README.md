# Cassowary World Lore

This repository is the documentation and canon foundation for the **Cassowary World** project.

It is organized as a layered causal knowledge base: real-world reference defines the baseline, divergences define what changes, lore explains what emerges, and stories demonstrate systems without defining canon.

## Start Here

- [Agent Instructions](docs/agent-instructions.md)
- [Repository Structure](docs/repository-structure.md)
- [Indexing and Generated Files](docs/indexing-and-generated-files.md)
- [Maintenance Backlog](docs/maintenance-backlog.md)

## Canon Authorities

- [Guiding Principles](docs/guiding-principles.md)
- [Core Logic](docs/core-logic.md)
- [Canon Index](generated/canon-index.md)
- [Open Questions](generated/open-questions.md)
- [Timeline Overview](generated/timeline-overview.md)

## Knowledge Layers

- `reference/` defines real-world baseline and world-state constraints.
- `lore/divergences/` defines deliberate changes from real-world history or biology.
- `lore/` defines Cassowary World systems that emerge from those constraints and divergences.
- `stories/` stores non-canon exploratory narrative material.
- `generated/` stores committed deterministic indexes derived from source docs.

## Core Rule

Nothing exists in canon without explanation. Every capability must emerge through biological evolution, ecological interaction, technological development, or cultural processes.

Generated files are query views, not source files. Update source docs and run the generator rather than editing generated views manually.
