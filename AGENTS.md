# AGENTS.md

## Role

Agents expand and maintain the canonical knowledge base of Cassowary World.

Agents do not invent arbitrary lore.  
Agents model biological, ecological, and civilizational evolution under constraints.

This repository is the source of truth.

Other applications may render it, but canon is defined here.

---

## Core Principle: Canon Must Be Explained

Nothing exists in canon without explanation.

Every capability must emerge through:

- biological evolution
- ecological interaction
- technological development
- or cultural processes

Avoid unexplained capability jumps.

Every system must have ancestry.

---

## Canon Development Pipeline

Agents must follow this pipeline:

### 1. Exploration (Non-Canon)

Exploratory content may be generated:

- story scenes
- speculative systems
- hypothetical scenarios

These are NOT canon.

Their purpose is to expose assumptions.

---

### 2. Assumption Extraction

Agents must identify factual assumptions introduced.

Examples:

- domesticated species exist
- preservation methods exist
- roads or transport exist
- political institutions exist

Each assumption becomes a candidate canon item.

---

### 3. Evaluation

Compare each candidate fact against:

- GUIDING_PRINCIPLES.md
- existing foundation documents
- existing technical documents

Classify each as:

- Compatible
- Contradictory
- Requires technical documentation
- Open question

Do not silently accept assumptions.

---

### 4. Technical Documentation

Accepted or candidate systems must be formalized in technical documents.

Technical documents convert ideas into structured canon.

Before drafting any new technical document, agents must read the reference example:

`technical-documents/honeypot-ant-domestication-and-sugar-preservation.md`

Use that document as the default structural model unless the subject clearly requires a different section order.

They must explain:

- what the system is
- how it works
- how it emerged
- what limits it
- what it enables

---

### 5. Canon Promotion

Facts become canon only when documented in:

- foundation files
- technical documents
- or timeline files

Stories are never canon by themselves.

---

### 6. Timeline Integration

Major systems must include approximate emergence periods.

Update:

03-history-and-timeline.md

Civilization evolves gradually.

---

### 7. Record Uncertainty

Unknowns must be recorded in:

99-open-questions.md

Do not invent answers to resolve uncertainty.

---

## Technical Document Requirements

Technical documents must include:

- Title
- Status (Draft / Canon Candidate / Canon)
- Summary
- Definition
- Mechanism / Process
- Evolutionary or Historical Emergence
- Constraints and Limits
- Civilizational Implications
- Related Documents
- Open Questions

Focus on mechanisms, not narrative.

---

## Technical Document Authoring Procedure (Required)

When an agent is asked to write a technical document about a subject, follow this procedure:

1. Read `technical-documents/honeypot-ant-domestication-and-sugar-preservation.md` first.
2. Copy its structure as the starting template.
3. Replace subject-specific content while preserving causal explanation and constraint language.
4. Link the document to relevant guiding principles and related technical/foundation docs.
5. Mark uncertain claims as `Draft` or `Canon Candidate`.
6. Record unresolved questions in the document's `Open Questions` section (and in `99-open-questions.md` when globally important).

This is mandatory so technical docs stay consistent in style, structure, and canon-evaluation quality.

## Technical Document Style Definition (Reference Standard)

The reference technical document demonstrates the expected style:

- neutral, encyclopedia-like tone
- explicit biological/ecological/technical mechanism
- timeline of emergence (when relevant)
- clear constraints and failure modes
- civilizational consequences
- dependency/enabling relationships between systems
- links to related documents

Agents should treat the honeypot-ant document as the model for "how to write a technical document" in this repository.

---

## Causality Requirement

Always connect causal chains:

biology → behavior → technology → infrastructure → institutions

Example:

grasping forelimbs → object transport → food storage → taxation → empire

---

## File Layout Rules

Root files contain stable foundation canon, canon indexes, and project-wide references.

principles/ links to project philosophy and canon constraints.

docs/ links to contributor-facing instructions and migration guides.

reference/ contains real-world baseline and world-state material.

lore/ contains the retrievable Cassowary World layer: fundamental divergences and focused system docs.

technical-documents/ contains retained source material and audit history during migration.

stories/ contains non-canon narrative exploration.

Do not create unnecessary folders beyond this layered structure.

Prefer updating existing documents or adding focused lore files over creating broad duplicate summaries.

---

## Canon Authority Order

Highest authority:

1. GUIDING_PRINCIPLES.md
2. Foundation documents
3. Canon technical documents
4. Draft technical documents
5. Stories and exploratory material

---

## Editing Rules

Preserve canon unless explicitly revised.

Avoid contradictions.

Maintain cross-document consistency.

Use clear headings and structured Markdown.
Use Markdown links in `Related Documents` sections (not plain path text).

---

## Long-Term Objective

Construct a coherent evolutionary and civilizational history of cassowary-derived intelligent life across Sahul.

Prioritize realism, causality, and internal consistency at all times.
