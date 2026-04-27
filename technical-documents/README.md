# Technical Documents

This folder is retained source material and audit history for Cassowary World migration. Active canon now lives in `reference/`, `lore/`, and `stories/`.

## Purpose of Technical Documents

Technical documents are used to formalize candidate or accepted systems such as:

- biological divergences and developmental changes
- ecological production chains
- agricultural and preservation methods
- infrastructure systems
- institutional mechanisms
- cross-system frameworks and classification models

## Technical Documents Define Mechanisms, Not Narrative

Technical documents explain causal systems. They do not establish canon through scenes, character moments, or story events alone.

Stories may generate assumptions, but technical documents (plus foundation/timeline docs) are where those assumptions are evaluated and formalized.

## Document Categories

Category folders under `technical-documents/`:

- `biology/` - anatomy, neurodevelopment, lifespan, evolutionary body changes
- `ecology/` - species interactions, domestication ecologies, predator relationships, orchard ecosystems
- `agriculture/` - orchard management, grafting, crop handling, cultivation practices
- `infrastructure/` - ceramics, storage, transport, roads, logistics hardware
- `institutions/` - tribute, taxation, ownership, governance mechanisms, communication systems
- `frameworks/` - classification systems, energy models, expansion models, planning abstractions

If a document is primarily a meta-model or classification system, place it in `frameworks/`.

## Canon Promotion Process

Technical docs should make status explicit:

- `Draft` - exploratory or partially specified; not canon
- `Canon Candidate` - plausible and structured, but still awaiting broader integration/validation
- `Canon` - explicitly promoted and treated as established repository canon
- `Deprecated` - retained for traceability but superseded or rejected

Standard progression:

1. Story or exploration introduces assumptions.
2. Assumptions are extracted and evaluated against guiding principles.
3. Technical document formalizes mechanism, limits, dependencies, and timeline placement.
4. Canon status is tracked in [`CANON_INDEX.md`](../CANON_INDEX.md).
5. Promotion to `Canon` occurs only with explicit confirmation.

## Dependency Requirements

Every technical document must include explicit dependency graph sections:

- `Depends On`
- `Enables`

Every technical document must also include:

- `Timeline Placement`
- `Constraints and Limits`
- `Open Questions`

If a dependency or enabling system is unknown, mark it explicitly as:

`Unknown — requires future technical document.`

## Reference Example

- [Honeypot Ant Domestication and Sugar Preservation](ecology/honeypot-ant-domestication-and-sugar-preservation.md)
- [Cassowary Neurodevelopment and Predator Management Transition](../lore/biology/cassowary-neurodevelopment-and-predator-management-transition.md)
- [Sahul Food Forest Functional Crop Portfolio](../lore/frameworks/sahul-food-forest-functional-crop-portfolio.md)

## Related Documents

- [Project README](../README.md)
- [Guiding Principles](../GUIDING_PRINCIPLES.md)
- [Core Logic](../CORE_LOGIC.md)
- [Canon Index](../CANON_INDEX.md)
- [Open Questions](../99-open-questions.md)
