# AGENTS.md

## Project Intent

This repository is a **Markdown-only lore source** for the Cassowary World story.

Agents should treat it as a canonical worldbuilding docs repo that may be embedded inside another project and rendered directly.

## File Layout Rules

- Keep core canon and story foundation docs as top-level `*.md` files
- Store subject-specific technical reference pages in `technical-documents/`
- Do not add code, build scripts, package files, or tooling unless explicitly requested
- Do not create additional folders unless explicitly requested
- Keep filenames stable and descriptive; prefer numbered prefixes for reading order in sequence docs

## Editing Rules

- Preserve existing canon unless the user asks to revise it
- When adding new lore, note assumptions and avoid contradicting other files
- Prefer updating the most relevant existing doc instead of creating duplicates
- Use Markdown headings and bullet lists for easy rendering in other repos/apps
- Keep sections scannable; avoid long unstructured paragraphs

## Cross-Document Consistency

- Align names, dates, factions, and terminology across files
- If a fact changes, update all affected docs in the same pass when possible
- Put unresolved items in `99-open-questions.md` instead of burying them elsewhere

## Canon Document Types

- Foundation docs: broad worldbuilding documents at the repo root (overview, regions, history, rules, story setup)
- Guiding principles: high-level constraints that all lore and stories must obey
- Technical documents: subject-level reference pages explaining how one system, event, species, technology, or institution works
- Open questions: unresolved canon decisions and conflicts

## Definition of a Technical Document

A technical document is a **Wikipedia-style lore reference page** about a single subject.

It should explain the subject clearly, state what is canon vs draft, describe how it works, and link to related documents so a reader can navigate the knowledge graph.

Technical documents are not prose scenes, character dialogue, or brainstorming dumps. They are structured reference pages for canon-building.

## How to Write Technical Documents

- Focus on one subject per document (example: a divergence event, a preservation method, a faction institution)
- Write in a neutral, explanatory tone
- Prefer explicit mechanisms and constraints over vague statements
- Mark uncertain claims as `Draft`, `Proposed`, or `Open Question`
- Add hyperlinks to related docs (root docs, guiding principles, and other technical docs)
- Explain causal links: anatomy -> behavior -> technology -> institutions
- If a claim changes world capability, connect it to `GUIDING_PRINCIPLES.md`

## Technical Document Required Sections (Default)

- `# Title`
- `Status` (Draft / Canon Candidate / Canon)
- `Summary`
- `Definition` (what the subject is)
- `Mechanism / Process` (how it works)
- `Constraints and Limits`
- `Implications for Civilization or Story`
- `Related Documents` (Markdown links)
- `Open Questions` (if any)

## Technical Document Hyperlink Rules

- Use relative Markdown links
- Link to at least one foundation doc and one principles/canon control doc when relevant
- Prefer links in a dedicated `Related Documents` section and inline links where context matters
- Update links if files are renamed or moved

## Definition of Guiding Principles

Guiding principles are the **constitutional rules** of Cassowary World.

They are not ordinary lore facts. They define the constraints used to evaluate whether new lore is plausible, on-theme, and consistent with the project.

They exist to prevent drift into arbitrary fantasy or contradiction.

## How to Interpret Guiding Principles

- Treat principles as constraints first, prompts second
- When a draft idea conflicts with a principle, the idea must be revised, justified in technical lore, or rejected
- Do not override a principle with a cool story moment without explicit user approval
- Translate principles into testable questions (example: "What energy source enables this institution?")
- Use principles to justify causal chains, not just end results
- If a principle seems ambiguous, document the ambiguity and add a question to `99-open-questions.md`
- When writing technical docs, explicitly note which guiding principles the doc depends on

## Canon Evaluation Order

- Guiding principles (`GUIDING_PRINCIPLES.md`)
- Confirmed canon in root foundation docs and accepted technical docs
- Draft technical docs and story ideas
- Open questions and speculative notes

## Scope for Now

- Focus on foundational worldbuilding and story setup
- Build a consistent technical-document corpus over time
- Leave advanced formatting, automation, and schemas for later

## Current Priority

- Strengthen `GUIDING_PRINCIPLES.md`
- Add technical documents for key systems (divergence, anatomy, sugar preservation, transport, governance)
- Cross-link documents so the repo can be rendered as a navigable lore reference

