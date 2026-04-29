# Agent Instructions

These are the detailed operating instructions for human and AI contributors working in the Cassowary World lore repository.

## Role

Agents expand and maintain the canonical knowledge base of Cassowary World.

Agents do not invent arbitrary lore.  
Agents model biological, ecological, and civilizational evolution under constraints.

This repository is the source of truth.

Other applications may render it, but canon is defined here.

## Core Principle: Canon Must Be Explained

Nothing exists in canon without explanation.

Every capability must emerge through:

- biological evolution
- ecological interaction
- technological development
- or cultural processes

Avoid unexplained capability jumps.

Every system must have ancestry.

## Canon Development Pipeline

Agents must follow this pipeline.

### 1. Exploration

Exploratory content may be generated:

- story scenes
- speculative systems
- hypothetical scenarios

Their purpose is to expose assumptions before they are formalized in reference, divergence, or lore docs.

### 2. Assumption Extraction

Agents must identify factual assumptions introduced.

Examples:

- domesticated species exist
- preservation methods exist
- roads or transport exist
- political institutions exist

Each assumption becomes a proposed fact to evaluate.

### 3. Evaluation

Compare each proposed fact against:

- [Guiding Principles](guiding-principles.md)
- existing foundation documents
- existing reference docs
- existing divergence docs
- existing lore docs

Classify each as:

- Compatible
- Contradictory
- Requires lore documentation
- Open question

Do not silently accept assumptions.

### 4. Lore Documentation

Accepted or proposed systems must be formalized in the active layered knowledge system.

Use the correct layer:

- `reference/` for real-world baseline and world-state constraints
- `lore/divergences/` for fundamental changes from the real world
- `lore/` for Cassowary World systems that emerge from baseline reality plus divergences
- `stories/` for non-canon narrative exploration

Lore system documents must explain:

- what the system is
- how it works
- how it emerged
- what limits it
- what it enables

### 5. Canon Inclusion

Facts become repository canon when committed in:

- foundation files
- reference files
- divergence files
- lore files
- story files
- or generated timeline views derived from source metadata

If a story introduces a durable world mechanic, extract that mechanic into the relevant reference, divergence, or lore document.

### 6. Timeline Integration

Major systems must include approximate emergence periods.

Add or update source document `Time periods` metadata so [Timeline Overview](../generated/timeline-overview.md) regenerates correctly.

Civilization evolves gradually.

### 7. Record Uncertainty

Unknowns must be recorded in source document `## Open Questions` sections so [Open Questions](../generated/open-questions.md) regenerates correctly.

Do not invent answers to resolve uncertainty.

## Lore Document Requirements

Focused lore system documents should include:

- Title
- Summary
- Metadata
- Atomic Notes
- Context
- Related Documents
- Open Questions

Focus on mechanisms, not narrative.

## Lore Document Authoring Procedure (Required)

When an agent is asked to write a lore document about a subject, follow this procedure:

1. Identify whether the material belongs in `reference/`, `lore/divergences/`, `lore/`, `stories/`, or a source document `Open Questions` section.
2. For system lore, follow the focused Markdown structure used by the honeypot-ant and tribute lore files.
3. Convert important canon-bearing content into Atomic Notes.
4. Link the document to relevant reference, divergence, lore, foundation, and timeline docs.
5. Record uncertain claims in the document's `Open Questions` section.
6. The global open-question view is generated from those sections.

This is mandatory so lore docs stay consistent in style, structure, and canon-evaluation quality.

## Lore Document Style Definition (Reference Standard)

The honeypot-ant and tribute lore documents demonstrate the expected style:

- neutral, encyclopedia-like tone
- explicit biological/ecological/technical mechanism
- timeline of emergence, when relevant
- clear constraints and failure modes
- civilizational consequences
- dependency/enabling relationships between systems
- links to related documents

Agents should treat those documents as models for focused system lore.

## Causality Requirement

Always connect causal chains:

biology -> behavior -> technology -> infrastructure -> institutions

Example:

grasping forelimbs -> object transport -> food storage -> taxation -> empire

## File Layout Rules

Root files contain stable foundation canon, canon indexes, and project-wide references.

`principles/` links to project philosophy and canon constraints.

`docs/` contains contributor-facing instructions, repository maintenance guidance, and process documentation.

`reference/` contains real-world baseline and world-state material.

`lore/` contains the retrievable Cassowary World layer: fundamental divergences and focused system docs.

`stories/` contains non-canon narrative exploration.

Do not create unnecessary folders beyond this layered structure.

Prefer updating existing documents or adding focused lore files over creating broad duplicate summaries.

## Canon Authority Order

Highest authority:

1. [Guiding Principles](guiding-principles.md)
2. Foundation documents
3. Reference, divergence, lore, and story documents
4. Generated views derived from source docs

## Editing Rules

Preserve canon unless explicitly revised.

Avoid contradictions.

Maintain cross-document consistency.

Use clear headings and structured Markdown.
Use Markdown links in `Related Documents` sections, not plain path text.

Generated files are deterministic views over source docs. Do not hand-edit generated files; update source docs and run the generator.

## Long-Term Objective

Construct a coherent evolutionary and civilizational history of cassowary-derived intelligent life across Sahul.

Prioritize realism, causality, and internal consistency at all times.
