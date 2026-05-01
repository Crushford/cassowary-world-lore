# Reference Layer

## Purpose

The reference layer defines real-world baseline constraints.

It answers:

- what is physically true
- what is biologically true
- what is ecologically true
- what is geographically true
- what constraints these facts impose

It does not describe Cassowary World inventions, institutions, cultural practices, or alternate-history outcomes.

## What Belongs in `reference/`

Include:

- real species biology
- extinct animal ecology
- geography
- climate
- sea level
- real ecological relationships
- habitat constraints
- world-state snapshots
- taxonomic uncertainty when it affects interpretation
- real-world environmental mechanisms

## What Does Not Belong in `reference/`

Do not include:

- Cassowary World inventions
- Cassowary World material culture
- technologies created or standardised by cassowaries
- social systems
- institutions
- symbolic meaning
- myths
- political economy
- trade systems
- domestication systems, unless describing a real-world biological baseline
- speculative outcomes

Those belong in `lore/`.

## Allowed Document Types

Three types of documents belong in `reference/`:

1. **World State Documents** — a snapshot of real-world conditions at a specific time. Contains geography, climate, ecology, and high-level species pressures. Example: `world-state-protohistoric-expansion-era.md`.

2. **System or Mechanism References** — explains how something real works. Example: cassowary biology, honeypot ants, aphid-ant relationships, fire ecology.

3. **Catalogs** — structured data summaries. Must include constraint interpretation, not just lists.

## Required Document Structure

Every reference doc must use this structure in this order:

1. **Summary** — short, dense, factual. States what the document is and why it matters.
2. **Metadata** — see below for required fields and rules.
3. **Core Reality** — what is true. No interpretation yet.
4. **Constraints** — what those facts force, limit, prevent, or require. This section is mandatory.
5. **System Implications** — translate constraints into system-level effects. Still no Cassowary World.
6. **Known Variability** — regional differences, seasonal differences, uncertainty ranges.
7. **Open Questions** — meaningful unknowns only. No filler.
8. **Related Documents** — explicit links to other reference docs.
9. **Used By Lore** — optional. Links to lore docs that directly consume this reference.

## Metadata Rules

Every reference doc must include:

```
## Metadata

- Primary topic: <topic>
- Layer: Real-world reference
- Topics: <comma-separated tags>
- Regions: <geographic scope>
- Related species: <if applicable>
```

**Time Metadata Rule**

The `Time periods` field is reserved for Cassowary World timeline labels that should appear in generated timeline indexes.

Do not put real-world geological periods, dates, or research windows in `Time periods`.

Use these fields instead when needed:

- `Real-world period: Early Pleistocene`
- `Real-world anchor: ~2 MYA`
- `Reference window: representative glacial maximum`

These fields describe the reference context but do not generate timeline sections.

Cassowary World era labels (`Protohistoric Expansion Era`, etc.) may be added to world-state documents only, not to species or ecology documents.

**Default: no time period.** Reference documents should be timeless constraint baselines unless they are world-state snapshots tied to a Cassowary World era.

## Style Rules

Reference docs must be compact, factual, and constraint-driven.

**Use constraint language:**

- requires, limits, prevents, forces, depends on
- imposes, constrains, bounds, determines

**Avoid:**

- interesting, important, suggests
- "Cassowary societies used this to develop..."
- "This became sacred to..."
- "They probably invented..."
- "This would be interesting for..."

Reference docs can say what a fact makes possible or difficult. They must not invent the Cassowary World response.

**Correct:**

> Large herbivores impose sustained vegetation pressure and movement risk for ground-based species.

**Incorrect:**

> "Diprotodon was large"

> Cassowary societies learned to manage dromornithid territories...

## Writing Rules

- No storytelling. No fluff. No duplication.
- Remove research framing: no "this paper says", "sources suggest", or methodology explanations. Convert to confident usable statements or clearly marked uncertainty.
- No Cassowary World leakage: never include cassowary culture, cassowary behaviour, or invented systems. Those belong in `lore/`.
- Each document must stand alone but combine cleanly with others.
- Structure must be predictable so it is queryable by an LLM.

## Linking Time Periods

Whenever a document mentions a defined Cassowary World time period in prose, link it to the generated time index:

- `[Protohistoric Expansion Era](../generated/time/protohistoric-expansion-era.md)`
- `[Early History Era](../generated/time/early-history-era.md)`
- `[Ecological Management Era](../generated/time/ecological-management-era.md)`
- `[Fire and Extended Development Era](../generated/time/fire-and-extended-development-era.md)`
- `[Claw Development Era](../generated/time/claw-development-era.md)`

Use correct relative paths from the file being edited.

## Reference-to-Lore Relationship

Reference docs should not depend on lore docs.

An optional `## Used By Lore` section provides controlled traceability in the other direction:

```markdown
## Used By Lore

- [Lore Document Title](../lore/folder/filename.md)
```

Rules:

- Do not explain the lore in the reference doc.
- Do not summarise Cassowary World systems.
- Only link to lore docs that directly depend on the reference constraints.

## Quality Bar

A reference doc is complete when:

- another agent can answer "what constraints does this impose?" from the Constraints section alone
- it can be used to generate lore without guessing
- it integrates cleanly with other reference docs
- it contains no research noise, storytelling, or Cassowary World leakage
- it does not require reading external research
