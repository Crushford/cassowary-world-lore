#!/usr/bin/env node
import { existsSync, promises as fs, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

type Severity = 'error' | 'warning';
type LayerCategory = 'foundation' | 'reference' | 'divergence' | 'lore' | 'story';

type Heading = {
  level: number;
  text: string;
  anchor: string;
};

type LinkRef = {
  text: string;
  href: string;
  line: number;
};

type ContentDoc = {
  relPath: string;
  absPath: string;
  title: string;
  titleLine: number | null;
  layerRaw: string | null;
  layerCategory: LayerCategory;
  layerDerived: boolean;
  status: string | null;
  summary: string;
  summarySource: 'section' | 'preamble' | 'missing';
  metadata: Map<string, string[]>;
  metadataOrder: Array<{ label: string; values: string[] }>;
  primaryTopic: string | null;
  topics: string[];
  timePeriods: string[];
  regions: string[];
  cultures: string[];
  relatedDocs: LinkRef[];
  atomicNotes: string[];
  openQuestions: string[];
  headings: Heading[];
  localLinks: LinkRef[];
  hasSummarySection: boolean;
  hasMetadataSection: boolean;
  hasOpenQuestionsSection: boolean;
};

type ValidationIssue = {
  severity: Severity;
  code: string;
  path: string | null;
  message: string;
};

type PageMap = Record<string, string>;

const ROOT_DIR = process.cwd();
const GENERATED_DIR = path.join(ROOT_DIR, 'generated');
const SCAN_DIRS = ['reference', 'lore', 'stories'];
const ROOT_DOC_ALLOWLIST = new Set([
  'docs/core-logic.md',
  'docs/guiding-principles.md',
]);
const IGNORED_DIRS = new Set(['.git', 'generated', 'node_modules', 'archive', 'old']);

const ALLOWED_TIME_LABELS = [
  '~12 MYA',
  '~6-4 MYA',
  '~4-3 MYA',
  '4-3 MYA',
  '~3-2.5 MYA',
  '~2.5-2 MYA',
  '~2 MYA',
  '~3.2-2.8 MYA',
  '~2.7-2.3 MYA',
  '~2.2-1.8 MYA',
  'early Pleistocene glacial cycles',
  '~2 MYA representative glacial maximum',
];
const ALLOWED_TIME_LABEL_KEYS = new Map(ALLOWED_TIME_LABELS.map((label) => [normalizeKey(label), label]));

const KNOWN_METADATA_LABELS = new Set([
  'Layer',
  'Status',
  'Purpose',
  'Primary topic',
  'Topics',
  'Time periods',
  'Regions',
  'Cultures',
  'Related species',
  'Related technologies',
  'Related institutions',
  'Related documents',
]);
const METADATA_LABEL_CANONICAL = new Map(Array.from(KNOWN_METADATA_LABELS, (label) => [normalizeKey(label), label] as const));
const MIN_TOPIC_DOCS = 2;
const LIST_METADATA_LABELS = new Set([
  'Topics',
  'Time periods',
  'Regions',
  'Cultures',
  'Related species',
  'Related technologies',
  'Related institutions',
  'Related documents',
]);

async function main() {
  const args = new Set(process.argv.slice(2));
  const checkMode = args.has('--check');

  const markdownFiles = await collectMarkdownFiles();
  const docs = await Promise.all(
    markdownFiles.map(async (relPath) => parseDocument(relPath)),
  );
  docs.sort((a, b) => a.relPath.localeCompare(b.relPath));

  const issues = validateDocs(docs);
  const generatedPages = buildGeneratedPages(docs, issues);

  if (checkMode) {
    const stale = await compareGeneratedPages(generatedPages);
    if (stale.length > 0) {
      for (const entry of stale) {
        issues.push({
          severity: 'error',
          code: 'stale-generated',
          path: entry,
          message: `Generated file differs from expected content: ${entry}`,
        });
      }
    }
  } else {
    await writeGeneratedPages(generatedPages);
  }

  if (issues.some((issue) => issue.severity === 'error')) {
    process.exitCode = 1;
    for (const issue of issues.filter((item) => item.severity === 'error')) {
      console.error(formatIssue(issue));
    }
  } else {
    for (const issue of issues.filter((item) => item.severity === 'warning')) {
      console.warn(formatIssue(issue));
    }
  }
}

async function collectMarkdownFiles() {
  const discovered = new Set<string>();

  for (const dir of SCAN_DIRS) {
    const absDir = path.join(ROOT_DIR, dir);
    if (await exists(absDir)) {
      await walkMarkdown(absDir, discovered);
    }
  }

  for (const relPath of ROOT_DOC_ALLOWLIST) {
    const absPath = path.join(ROOT_DIR, relPath);
    if (await exists(absPath)) {
      discovered.add(toPosix(relPath));
    }
  }

  return Array.from(discovered).sort((a, b) => a.localeCompare(b));
}

async function walkMarkdown(absDir: string, discovered: Set<string>) {
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      await walkMarkdown(path.join(absDir, entry.name), discovered);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue;
    }

    if (entry.name === 'README.md') {
      continue;
    }

    discovered.add(toPosix(path.relative(ROOT_DIR, path.join(absDir, entry.name))));
  }
}

async function parseDocument(relPath: string): Promise<ContentDoc> {
  const absPath = path.join(ROOT_DIR, relPath);
  const raw = await fs.readFile(absPath, 'utf8');
  const lines = raw.split(/\r?\n/);

  const headings: Heading[] = [];
  const localLinks = extractLinks(raw);
  const sections = new Map<string, string[]>();
  const preamble: string[] = [];
  const headingAnchors = new Set<string>();

  let title = '';
  let titleLine: number | null = null;
  let currentSection: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const anchor = headingToAnchor(text);
      headings.push({ level, text, anchor });
      headingAnchors.add(anchor);

      if (level === 1 && !title) {
        title = text;
        titleLine = index + 1;
        currentSection = null;
        continue;
      }

      if (level === 2) {
        currentSection = normalizeSectionName(text);
        sections.set(currentSection, []);
        continue;
      }
    }

    if (currentSection) {
      sections.get(currentSection)?.push(line);
    } else if (title) {
      preamble.push(line);
    }
  }

  const titleFallback = title || inferTitleFromPath(relPath);
  const sectionSummary = sections.get('summary') ?? [];
  const summaryFromSection = cleanText(extractFirstParagraph(sectionSummary));
  const preambleSummaryLines = preamble.filter((line) => !parseMetadataLine(line));
  const summaryFromPreamble = cleanText(extractFirstParagraph(preambleSummaryLines));

  const metadataLines = [
    ...(sections.get('metadata') ?? []),
    ...preamble,
  ];
  const metadata = new Map<string, string[]>();
  const metadataOrder: Array<{ label: string; values: string[] }> = [];
  const metadataProblems: ValidationIssue[] = [];
  for (const line of metadataLines) {
    const parsed = parseMetadataLine(line);
    if (!parsed) {
      continue;
    }

    const { label, values } = parsed;
    const existing = metadata.get(label) ?? [];
    const combined = [...existing, ...values];
    metadata.set(label, combined);
    metadataOrder.push({ label, values });
  }

  const primaryTopic = firstValue(metadata, 'Primary topic');
  const explicitTopics = listValue(metadata, 'Topics');
  const titleTopic = inferTopicFromDocument(relPath, titleFallback, metadata);
  const topics = uniqueStrings([
    ...explicitTopics.map((topic) => displayTopicLabel(topic)),
    ...(titleTopic ? [displayTopicLabel(titleTopic)] : []),
  ]);
  const timePeriods = uniqueStrings(listValue(metadata, 'Time periods'));
  const regions = uniqueStrings(listValue(metadata, 'Regions'));
  const cultures = uniqueStrings(listValue(metadata, 'Cultures'));
  const relatedDocs = extractRelatedDocuments(sections.get('related documents') ?? []);
  const atomicNotes = extractBullets(sections.get('atomic notes') ?? []);
  const openQuestions = extractBullets(sections.get('open questions') ?? []);
  const summary = summaryFromSection || summaryFromPreamble;
  const summarySource = summaryFromSection ? 'section' : summaryFromPreamble ? 'preamble' : 'missing';

  const layerRaw = firstValue(metadata, 'Layer') ?? inferLayerRawFromPath(relPath);
  const layerCategory = inferLayerCategory(relPath, layerRaw);
  const layerDerived = !hasLabel(metadata, 'Layer');
  const status = firstValue(metadata, 'Status');

  if (metadataProblems.length > 0) {
    // no-op placeholder, kept for symmetry if parsing gains structured warnings later
  }

  return {
    relPath: toPosix(relPath),
    absPath,
    title: titleFallback,
    titleLine,
    layerRaw,
    layerCategory,
    layerDerived,
    status,
    summary,
    summarySource,
    metadata,
    metadataOrder,
    primaryTopic,
    topics,
    timePeriods,
    regions,
    cultures,
    relatedDocs,
    atomicNotes,
    openQuestions,
    headings,
    localLinks,
    hasSummarySection: sections.has('summary'),
    hasMetadataSection: sections.has('metadata'),
    hasOpenQuestionsSection: sections.has('open questions'),
  };
}

function validateDocs(docs: ContentDoc[]) {
  const issues: ValidationIssue[] = [];
  const titleMap = new Map<string, ContentDoc[]>();
  for (const doc of docs) {
    const normalizedTitle = normalizeKey(doc.title);
    const titleBucket = titleMap.get(normalizedTitle) ?? [];
    titleBucket.push(doc);
    titleMap.set(normalizedTitle, titleBucket);

    if (!doc.title || !doc.titleLine) {
      issues.push({
        severity: 'error',
        code: 'missing-title',
        path: doc.relPath,
        message: 'Missing top-level H1 title',
      });
    }

    if (doc.layerDerived && doc.layerCategory !== 'foundation') {
      issues.push({
        severity: 'warning',
        code: 'derived-layer',
        path: doc.relPath,
        message: `Layer was inferred from path rather than stated explicitly: ${doc.layerCategory}`,
      });
    }

    if (!doc.summary) {
      issues.push({
        severity: 'warning',
        code: 'missing-summary',
        path: doc.relPath,
        message: 'No Summary section or intro paragraph was found',
      });
    } else if (!doc.hasSummarySection) {
      issues.push({
        severity: 'warning',
        code: 'summary-fallback',
        path: doc.relPath,
        message: `Summary was derived from the preamble instead of a dedicated section (${doc.summarySource})`,
      });
    }

    validateLayerStructure(doc, issues);
    validateDiscoverability(doc, issues);

    if (doc.timePeriods.length > 0) {
      for (const label of doc.timePeriods) {
        if (!ALLOWED_TIME_LABEL_KEYS.has(normalizeKey(label))) {
          issues.push({
            severity: 'error',
            code: 'unknown-time-label',
            path: doc.relPath,
            message: `Unknown time label: ${label}`,
          });
        }
      }
    }

    if (doc.metadata.size > 0) {
      for (const [label, values] of doc.metadata.entries()) {
        if (!KNOWN_METADATA_LABELS.has(label)) {
          issues.push({
            severity: 'warning',
            code: 'unknown-metadata-label',
            path: doc.relPath,
            message: `Unexpected metadata label: ${label}`,
          });
        }

        const normalizedValues = values.map((value) => value.trim()).filter(Boolean);
        if (normalizedValues.length !== uniqueStrings(normalizedValues).length) {
          issues.push({
            severity: 'warning',
            code: 'duplicate-metadata-value',
            path: doc.relPath,
            message: `Repeated metadata value detected for ${label}`,
          });
        }
      }
    }

    const duplicatedLabels = findDuplicateLabels(doc.metadataOrder);
    for (const label of duplicatedLabels) {
      issues.push({
        severity: 'warning',
        code: 'duplicate-metadata-label',
        path: doc.relPath,
        message: `Metadata label appears more than once: ${label}`,
      });
    }

    for (const link of doc.localLinks) {
      const linkIssues = validateLink(doc.relPath, link.href);
      for (const issue of linkIssues) {
        issues.push({
          severity: issue.severity,
          code: issue.code,
          path: doc.relPath,
          message: issue.message,
        });
      }
    }
  }

  for (const [normalizedTitle, bucket] of titleMap.entries()) {
    if (bucket.length > 1) {
      issues.push({
        severity: 'error',
        code: 'duplicate-title',
        path: bucket.map((doc) => doc.relPath).join(', '),
        message: `Duplicate title detected for "${bucket[0].title}"`,
      });
    }
  }

  return issues;
}

function validateDiscoverability(doc: ContentDoc, issues: ValidationIssue[]) {
  if (doc.layerCategory === 'foundation') {
    return;
  }

  if (doc.topics.length > 0 || doc.timePeriods.length > 0 || doc.regions.length > 0 || doc.cultures.length > 0) {
    return;
  }

  issues.push({
    severity: 'warning',
    code: 'orphaned-doc',
    path: doc.relPath,
    message: 'Doc has no extractable topic, time period, region, or culture metadata',
  });
}

function validateLayerStructure(doc: ContentDoc, issues: ValidationIssue[]) {
  if (!['reference', 'divergence', 'lore', 'story'].includes(doc.layerCategory)) {
    return;
  }

  if (!doc.hasMetadataSection) {
    issues.push({
      severity: 'warning',
      code: 'missing-metadata-section',
      path: doc.relPath,
      message: 'Missing Metadata section',
    });
  }

  if (!doc.status) {
    issues.push({
      severity: 'warning',
      code: 'missing-status',
      path: doc.relPath,
      message: 'Missing Status metadata',
    });
  }

  if (!hasLabel(doc.metadata, 'Layer')) {
    issues.push({
      severity: 'warning',
      code: 'missing-layer',
      path: doc.relPath,
      message: 'Missing Layer metadata',
    });
  }

  if (doc.layerCategory === 'reference') {
    if (!doc.primaryTopic && doc.topics.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'lore-doc-missing-topic',
        path: doc.relPath,
        message: 'Missing Primary topic or Topics metadata',
      });
    }
    return;
  }

  if (doc.layerCategory === 'story') {
    if (!doc.status || !normalizeKey(doc.status).includes('non-canon')) {
      issues.push({
        severity: 'error',
        code: 'story-not-marked-non-canon',
        path: doc.relPath,
        message: 'Story docs must be explicitly marked non-canon in Status metadata',
      });
    }
    return;
  }

  if (doc.atomicNotes.length === 0) {
    issues.push({
      severity: 'warning',
      code: 'missing-atomic-notes',
      path: doc.relPath,
      message: 'Missing Atomic Notes bullets',
    });
  }

  if (doc.relatedDocs.length === 0) {
    issues.push({
      severity: 'warning',
      code: 'missing-related-documents',
      path: doc.relPath,
      message: 'Missing Related Documents links',
    });
  }

  if (!doc.hasOpenQuestionsSection) {
    issues.push({
      severity: 'warning',
      code: 'missing-open-questions-section',
      path: doc.relPath,
      message: 'Missing Open Questions section',
    });
  }

  if (doc.layerCategory === 'lore' && !doc.primaryTopic && doc.topics.length === 0) {
    issues.push({
      severity: 'warning',
      code: 'lore-doc-missing-topic',
      path: doc.relPath,
      message: 'Missing Primary topic or Topics metadata',
    });
  }

  if (doc.status === 'Canon Candidate' && doc.timePeriods.length === 0) {
    issues.push({
      severity: 'error',
      code: 'canon-candidate-missing-time-period',
      path: doc.relPath,
      message: 'Canon Candidate docs must include Time periods metadata',
    });
  }

  if (doc.status === 'Canon' && doc.timePeriods.length === 0) {
    issues.push({
      severity: 'error',
      code: 'canon-missing-time-period',
      path: doc.relPath,
      message: 'Canon docs must include Time periods metadata',
    });
  }
}

function buildGeneratedPages(docs: ContentDoc[], issues: ValidationIssue[]): PageMap {
  const pages: PageMap = {};
  const indexBase = 'generated';

  const topicMap = groupByTopic(docs);
  const layerMap = groupByLayer(docs);
  const statusMap = groupByStatus(docs);
  const timeMap = groupByTime(docs);
  const folderSummaryMap = groupBySummaryFolder(docs);
  const topicSummaryMap = groupByTopic(docs);

  pages[path.posix.join(indexBase, 'README.md')] = renderGeneratedReadme(topicMap, layerMap, statusMap, timeMap, folderSummaryMap, topicSummaryMap);
  pages[path.posix.join(indexBase, 'content-index.md')] = renderContentIndex(docs);
  pages[path.posix.join(indexBase, 'canon-index.md')] = renderCanonIndex(docs);
  pages[path.posix.join(indexBase, 'open-questions.md')] = renderOpenQuestions(docs);
  pages[path.posix.join(indexBase, 'timeline-overview.md')] = renderTimelineOverview(timeMap);
  pages[path.posix.join(indexBase, 'topics.md')] = renderTopicLookupPage(topicMap);

  for (const [layer, layerDocs] of layerMap.entries()) {
    pages[path.posix.join(indexBase, 'layers', `${slugify(layer, false)}.md`)] = renderLayerPage(layer, layerDocs);
  }

  for (const [status, statusDocs] of statusMap.entries()) {
    pages[path.posix.join(indexBase, 'status', `${slugify(status, false)}.md`)] = renderStatusPage(status, statusDocs);
  }

  for (const [label, timeDocs] of timeMap.entries()) {
    pages[path.posix.join(indexBase, 'time', `${slugify(label, true)}.md`)] = renderTimePage(label, timeDocs);
  }

  for (const [folder, folderDocs] of folderSummaryMap.entries()) {
    pages[path.posix.join(indexBase, 'summaries', 'by-folder', `${slugify(folder, true)}.md`)] = renderFolderSummary(folder, folderDocs);
  }

  for (const [topic, topicDocs] of topicSummaryMap.entries()) {
    pages[path.posix.join(indexBase, 'summaries', 'by-topic', `${slugify(topic, true)}.md`)] = renderTopicSummary(topic, topicDocs);
  }

  pages[path.posix.join(indexBase, 'summaries', 'README.md')] = renderSummariesReadme(folderSummaryMap, topicSummaryMap);
  pages[path.posix.join(indexBase, 'validation-report.md')] = renderValidationReport(issues, docs, pages, topicMap);

  return pages;
}

async function writeGeneratedPages(pages: PageMap) {
  await ensureDir(GENERATED_DIR);
  await removeStaleGeneratedFiles(pages);
  for (const [relPath, content] of Object.entries(pages).sort(([left], [right]) => left.localeCompare(right))) {
    await compareOrWrite(path.join(ROOT_DIR, relPath), content, false);
  }
}

async function compareGeneratedPages(pages: PageMap) {
  const stale: string[] = [];
  for (const [relPath, content] of Object.entries(pages).sort(([left], [right]) => left.localeCompare(right))) {
    const absPath = path.join(ROOT_DIR, relPath);
    const current = await readIfExists(absPath);
    if (current !== content) {
      stale.push(relPath);
    }
  }
  const desiredPaths = new Set(Object.keys(pages));
  for (const existing of await listGeneratedMarkdownFiles()) {
    const relPath = toPosix(path.relative(ROOT_DIR, existing));
    if (!desiredPaths.has(relPath)) {
      stale.push(relPath);
    }
  }
  return stale;
}

async function compareOrWrite(absPath: string, content: string, checkMode: boolean) {
  if (checkMode) {
    const current = await readIfExists(absPath);
    if (current !== content) {
      throw new Error(`Stale generated file: ${path.relative(ROOT_DIR, absPath)}`);
    }
    return;
  }

  await ensureDir(path.dirname(absPath));
  const current = await readIfExists(absPath);
  if (current !== content) {
    await fs.writeFile(absPath, content, 'utf8');
  }
}

async function removeStaleGeneratedFiles(pages: PageMap) {
  const desiredPaths = new Set(Object.keys(pages));
  for (const existing of await listGeneratedMarkdownFiles()) {
    const relPath = toPosix(path.relative(ROOT_DIR, existing));
    if (!desiredPaths.has(relPath)) {
      await fs.rm(existing);
    }
  }
}

function renderGeneratedReadme(
  topicMap: Map<string, ContentDoc[]>,
  layerMap: Map<string, ContentDoc[]>,
  statusMap: Map<string, ContentDoc[]>,
  timeMap: Map<string, ContentDoc[]>,
  folderSummaryMap: Map<string, ContentDoc[]>,
  topicSummaryMap: Map<string, ContentDoc[]>,
) {
  const layerLinks = Array.from(layerMap.keys())
    .map((layer) => `- [${layerDisplayName(layer as LayerCategory)}](layers/${slugify(layer, false)}.md)`);
  const statusLinks = Array.from(statusMap.keys())
    .sort((a, b) => a.localeCompare(b))
    .map((status) => `- [${status}](status/${slugify(status, false)}.md)`);
  const timeLinks = Array.from(timeMap.keys())
    .sort((a, b) => timeLabelSort(a, b))
    .map((time) => `- [${time}](time/${slugify(time, true)}.md)`);
  const folderSummaryLinks = Array.from(folderSummaryMap.keys())
    .map((folder) => `- [${folder}](summaries/by-folder/${slugify(folder, true)}.md)`);
  const topicSummaryLinks = Array.from(topicSummaryMap.keys())
    .map((topic) => `- [${topic}](summaries/by-topic/${slugify(topic, true)}.md)`);

  return [
    '# Generated Indexes',
    '',
    'This directory contains deterministic Markdown views derived from the hand-authored source docs.',
    '',
    '## Core Views',
    '',
    '- [Content Index](content-index.md)',
    '- [Canon Index](canon-index.md)',
    '- [Open Questions](open-questions.md)',
    '- [Timeline Overview](timeline-overview.md)',
    '- [Validation Report](validation-report.md)',
    '',
    '## Topic Indexes',
    '',
    '- [Topic Lookup](topics.md)',
    '',
    '## Layer Indexes',
    '',
    ...(layerLinks.length > 0 ? layerLinks : ['- No layer indexes were generated.']),
    '',
    '## Status Indexes',
    '',
    ...(statusLinks.length > 0 ? statusLinks : ['- No status indexes were generated.']),
    '',
    '## Time Indexes',
    '',
    ...(timeLinks.length > 0 ? timeLinks : ['- No time indexes were generated.']),
    '',
    '## Summary Bundles',
    '',
    '- [Summary Bundle Index](summaries/README.md)',
    '',
    '### By Folder',
    '',
    ...(folderSummaryLinks.length > 0 ? folderSummaryLinks : ['- No folder summary bundles were generated.']),
    '',
    '### By Topic',
    '',
    ...(topicSummaryLinks.length > 0 ? topicSummaryLinks : ['- No topic summary bundles were generated.']),
  ].join('\n');
}

function renderContentIndex(docs: ContentDoc[]) {
  const rows = docs.map((doc) => [
    markdownLink(doc.title, repoRelativeLink('generated/content-index.md', doc.relPath)),
    escapeCell(layerDisplayName(doc.layerCategory)),
    escapeCell(doc.status ?? ''),
    escapeCell(formatInlineList(doc.topics)),
    escapeCell(formatInlineList(doc.timePeriods)),
    escapeCell(shortSummary(doc.summary)),
    escapeCell(doc.relPath),
  ]);

  return [
    '# Content Index',
    '',
    'Deterministic overview of all scanned source docs.',
    '',
    renderTable(
      ['Title', 'Layer', 'Status', 'Topics', 'Time Periods', 'Summary', 'Path'],
      rows,
    ),
  ].join('\n');
}

function renderTopicLookupPage(topicMap: Map<string, ContentDoc[]>) {
  const eligibleTopics = Array.from(topicMap.entries())
    .filter(([, docs]) => docs.length >= MIN_TOPIC_DOCS)
    .sort(([left], [right]) => left.localeCompare(right));

  const lines = [
    '# Topic Lookup',
    '',
    'Back-of-book style index of topics with at least two references.',
    '',
  ];

  if (eligibleTopics.length === 0) {
    lines.push('No topics meet the two-reference minimum yet.');
    return lines.join('\n');
  }

  for (const [topic, topicDocs] of eligibleTopics) {
    lines.push(`## ${topic}`, '');
    lines.push(
      renderTable(
        ['Title', 'Path', 'Layer', 'Status', 'Summary', 'Time Periods'],
        topicDocs
          .slice()
          .sort((a, b) => sortDocs(a, b))
          .map((doc) => [
            markdownLink(doc.title, repoRelativeLink('generated/topics.md', doc.relPath)),
            escapeCell(doc.relPath),
            escapeCell(layerDisplayName(doc.layerCategory)),
            escapeCell(doc.status ?? ''),
            escapeCell(shortSummary(doc.summary)),
            escapeCell(formatInlineList(doc.timePeriods)),
          ]),
      ),
    );
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function renderCanonIndex(docs: ContentDoc[]) {
  const sectionOrder = [
    'Canon',
    'Canon Candidates',
    'Draft Systems',
    'Reference Baseline',
    'Divergences',
    'Stories',
    'Unstated Status',
  ];
  const buckets = new Map(sectionOrder.map((section) => [section, [] as ContentDoc[]]));

  for (const doc of docs.filter((item) => item.layerCategory !== 'foundation')) {
    buckets.get(canonIndexSection(doc))?.push(doc);
  }

  const lines = [
    '# Canon Index',
    '',
    'Generated canon-status view from source document metadata.',
    '',
  ];

  for (const section of sectionOrder) {
    const sectionDocs = (buckets.get(section) ?? []).slice().sort((a, b) => sortDocs(a, b));
    lines.push(`## ${section}`, '');
    if (sectionDocs.length === 0) {
      lines.push('No entries found.', '');
      continue;
    }
    lines.push(renderTable(
      ['Title', 'Path', 'Layer', 'Status', 'Time Periods', 'Summary'],
      sectionDocs.map((doc) => [
        markdownLink(doc.title, repoRelativeLink('generated/canon-index.md', doc.relPath)),
        escapeCell(doc.relPath),
        escapeCell(layerDisplayName(doc.layerCategory)),
        escapeCell(doc.status ?? ''),
        escapeCell(formatInlineList(doc.timePeriods)),
        escapeCell(shortSummary(doc.summary)),
      ]),
    ));
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function renderOpenQuestions(docs: ContentDoc[]) {
  const questionDocs = docs
    .filter((doc) => doc.openQuestions.length > 0)
    .sort((a, b) => sortDocs(a, b));
  const topicMap = new Map<string, ContentDoc[]>();

  for (const doc of questionDocs) {
    const topic = doc.primaryTopic ? displayTopicLabel(doc.primaryTopic) : doc.topics[0] ?? 'Uncategorised';
    const bucket = topicMap.get(topic) ?? [];
    bucket.push(doc);
    topicMap.set(topic, bucket);
  }

  const lines = [
    '# Open Questions',
    '',
    'Generated from `## Open Questions` sections across source docs.',
    '',
  ];

  if (topicMap.size === 0) {
    lines.push('No open questions were found.');
    return lines.join('\n');
  }

  for (const [topic, topicDocs] of Array.from(topicMap.entries()).sort(([left], [right]) => left.localeCompare(right))) {
    lines.push(`## ${topic}`, '');
    for (const doc of uniqueDocs(topicDocs).sort((a, b) => sortDocs(a, b))) {
      lines.push(`### ${doc.title}`, '');
      lines.push(`Source: \`${doc.relPath}\``, '');
      for (const question of doc.openQuestions) {
        lines.push(`- ${question}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd();
}

function renderTimelineOverview(timeMap: Map<string, ContentDoc[]>) {
  const lines = [
    '# Timeline Overview',
    '',
    'Generated from source document `Time periods` metadata.',
    '',
  ];

  if (timeMap.size === 0) {
    lines.push('No timeline metadata was found.');
    return lines.join('\n');
  }

  for (const [timeLabel, timeDocs] of timeMap.entries()) {
    const sortedDocs = timeDocs.slice().sort((a, b) => sortDocs(a, b));
    lines.push(`## ${timeLabel}`, '');
    lines.push(renderTable(
      ['Title', 'Path', 'Layer', 'Status', 'Summary'],
      sortedDocs.map((doc) => [
        markdownLink(doc.title, repoRelativeLink('generated/timeline-overview.md', doc.relPath)),
        escapeCell(doc.relPath),
        escapeCell(layerDisplayName(doc.layerCategory)),
        escapeCell(doc.status ?? ''),
        escapeCell(shortSummary(doc.summary)),
      ]),
    ));
    lines.push('');

    const notes = sortedDocs.flatMap((doc) => doc.atomicNotes.map((note) => ({ doc, note })));
    if (notes.length > 0) {
      lines.push('### Key Atomic Notes', '');
      for (const { doc, note } of notes) {
        lines.push(`- ${doc.title}: ${note}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd();
}

function renderLayerPage(layer: string, docs: ContentDoc[]) {
  const grouped = groupByFolder(docs);
  const sections: string[] = [`# Layer Index: ${layer}`, '', 'Grouped by folder.'];

  for (const [folder, folderDocs] of grouped.entries()) {
    const rows = folderDocs
      .slice()
      .sort((a, b) => sortDocs(a, b))
      .map((doc) => [
        markdownLink(doc.title, repoRelativeLink(`generated/layers/${slugify(layer, false)}.md`, doc.relPath)),
        escapeCell(doc.relPath),
        escapeCell(doc.status ?? ''),
        escapeCell(formatInlineList(doc.timePeriods)),
        escapeCell(shortSummary(doc.summary)),
      ]);

    sections.push('', `## ${folder}`);
    sections.push(renderTable(['Title', 'Path', 'Status', 'Time Periods', 'Summary'], rows));
  }

  return sections.join('\n');
}

function renderStatusPage(status: string, docs: ContentDoc[]) {
  const rows = docs
    .slice()
    .sort((a, b) => sortDocs(a, b))
    .map((doc) => [
      markdownLink(doc.title, repoRelativeLink(`generated/status/${slugify(status, false)}.md`, doc.relPath)),
      escapeCell(doc.relPath),
      escapeCell(layerDisplayName(doc.layerCategory)),
      escapeCell(formatInlineList(doc.timePeriods)),
      escapeCell(shortSummary(doc.summary)),
    ]);

  return [
    `# Status Index: ${status}`,
    '',
    renderTable(['Title', 'Path', 'Layer', 'Time Periods', 'Summary'], rows),
  ].join('\n');
}

function renderTimePage(timeLabel: string, docs: ContentDoc[]) {
  const rows = docs
    .slice()
    .sort((a, b) => sortDocs(a, b))
    .map((doc) => [
      markdownLink(doc.title, repoRelativeLink(`generated/time/${slugify(timeLabel, true)}.md`, doc.relPath)),
      escapeCell(doc.relPath),
      escapeCell(layerDisplayName(doc.layerCategory)),
      escapeCell(doc.status ?? ''),
      escapeCell(shortSummary(doc.summary)),
      escapeCell(formatInlineList(doc.topics)),
    ]);

  return [
    `# Time Index: ${timeLabel}`,
    '',
    renderTable(['Title', 'Path', 'Layer', 'Status', 'Summary', 'Topics'], rows),
  ].join('\n');
}

function renderFolderSummary(folder: string, docs: ContentDoc[]) {
  const sourcePage = `generated/summaries/by-folder/${slugify(folder, true)}.md`;
  const sortedDocs = docs.slice().sort((a, b) => sortDocs(a, b));
  const lines = [
    `# Folder Summary: ${folder}`,
    '',
    `Generated summary bundle for documents in \`${folder}\`.`,
    '',
    '## Documents',
    '',
    renderTable(
      ['Title', 'Status', 'Time Periods', 'Summary'],
      sortedDocs.map((doc) => [
        markdownLink(doc.title, repoRelativeLink(sourcePage, doc.relPath)),
        escapeCell(doc.status ?? ''),
        escapeCell(formatInlineList(doc.timePeriods)),
        escapeCell(shortSummary(doc.summary)),
      ]),
    ),
    '',
  ];

  appendAtomicNotes(lines, sortedDocs);
  appendRelatedDocuments(lines, sortedDocs, sourcePage);
  appendOpenQuestions(lines, sortedDocs);

  return lines.join('\n').trimEnd();
}

function renderTopicSummary(topic: string, docs: ContentDoc[]) {
  const sourcePage = `generated/summaries/by-topic/${slugify(topic, true)}.md`;
  const sortedDocs = docs.slice().sort((a, b) => sortDocs(a, b));
  const lines = [
    `# Topic Summary: ${topic}`,
    '',
    `Generated summary bundle for docs tagged with \`${topic}\`.`,
    '',
    '## Documents',
    '',
    renderTable(
      ['Title', 'Path', 'Layer', 'Status', 'Time Periods', 'Summary'],
      sortedDocs.map((doc) => [
        markdownLink(doc.title, repoRelativeLink(sourcePage, doc.relPath)),
        escapeCell(doc.relPath),
        escapeCell(layerDisplayName(doc.layerCategory)),
        escapeCell(doc.status ?? ''),
        escapeCell(formatInlineList(doc.timePeriods)),
        escapeCell(shortSummary(doc.summary)),
      ]),
    ),
    '',
    '## Layer Breakdown',
    '',
  ];

  const layerGroups = groupByLayer(sortedDocs);
  for (const layer of ['reference', 'divergence', 'lore', 'story'] as LayerCategory[]) {
    const layerDocs = layerGroups.get(layer) ?? [];
    lines.push(`### ${layerDisplayName(layer)}`, '');
    if (layerDocs.length === 0) {
      lines.push('No entries found.', '');
      continue;
    }
    for (const doc of layerDocs.slice().sort((a, b) => sortDocs(a, b))) {
      lines.push(`- ${markdownLink(doc.title, repoRelativeLink(sourcePage, doc.relPath))}`);
    }
    lines.push('');
  }

  appendAtomicNotes(lines, sortedDocs);
  appendOpenQuestions(lines, sortedDocs);
  appendRelatedTopics(lines, topic, sortedDocs);

  return lines.join('\n').trimEnd();
}

function renderSummariesReadme(
  folderSummaryMap: Map<string, ContentDoc[]>,
  topicSummaryMap: Map<string, ContentDoc[]>,
) {
  const folderLinks = Array.from(folderSummaryMap.keys())
    .map((folder) => `- [${folder}](by-folder/${slugify(folder, true)}.md)`);
  const topicLinks = Array.from(topicSummaryMap.keys())
    .map((topic) => `- [${topic}](by-topic/${slugify(topic, true)}.md)`);

  return [
    '# Summary Bundles',
    '',
    'Generated LLM-friendly context bundles derived from source docs.',
    '',
    '## By Folder',
    '',
    ...(folderLinks.length > 0 ? folderLinks : ['- No folder summary bundles were generated.']),
    '',
    '## By Topic',
    '',
    ...(topicLinks.length > 0 ? topicLinks : ['- No topic summary bundles were generated.']),
  ].join('\n');
}

function renderValidationReport(issues: ValidationIssue[], docs: ContentDoc[], pages: PageMap, topicMap: Map<string, ContentDoc[]>) {
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const topicCount = topicMap.size;
  const timeCount = Object.keys(pages).filter((key) => key.includes('/time/')).length;
  const layerCount = Object.keys(pages).filter((key) => key.includes('/layers/')).length;
  const statusCount = Object.keys(pages).filter((key) => key.includes('/status/')).length;

  const lines = [
    '# Validation Report',
    '',
    `- Docs scanned: ${docs.length}`,
    `- Topic indexes: ${topicCount}`,
    `- Time indexes: ${timeCount}`,
    `- Layer indexes: ${layerCount}`,
    `- Status indexes: ${statusCount}`,
    `- Errors: ${errors.length}`,
    `- Warnings: ${warnings.length}`,
    '',
  ];

  if (errors.length === 0 && warnings.length === 0) {
    lines.push('No validation issues were found.');
    return lines.join('\n');
  }

  if (errors.length > 0) {
    lines.push('## Errors', '');
    for (const issue of errors) {
      lines.push(`- ${formatIssue(issue)}`);
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push('## Warnings', '');
    for (const issue of warnings) {
      lines.push(`- ${formatIssue(issue)}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function groupByTopic(docs: ContentDoc[]) {
  const map = new Map<string, ContentDoc[]>();
  for (const doc of docs) {
    const topicKeys = doc.topics.length > 0 ? doc.topics : [];
    for (const topic of topicKeys) {
      const bucket = map.get(topic) ?? [];
      bucket.push(doc);
      map.set(topic, bucket);
    }
  }
  const filtered = Array.from(map.entries()).filter(([, docsForTopic]) => docsForTopic.length >= MIN_TOPIC_DOCS);
  return new Map(filtered.sort(([left], [right]) => left.localeCompare(right)));
}

function groupByLayer(docs: ContentDoc[]) {
  const map = new Map<string, ContentDoc[]>();
  for (const doc of docs) {
    const bucket = map.get(doc.layerCategory) ?? [];
    bucket.push(doc);
    map.set(doc.layerCategory, bucket);
  }
  return new Map(Array.from(map.entries()).sort(([left], [right]) => layerSortOrder(left) - layerSortOrder(right) || left.localeCompare(right)));
}

function groupByStatus(docs: ContentDoc[]) {
  const map = new Map<string, ContentDoc[]>();
  for (const doc of docs) {
    const status = doc.status ?? 'Unstated';
    const bucket = map.get(status) ?? [];
    bucket.push(doc);
    map.set(status, bucket);
  }
  return new Map(Array.from(map.entries()).sort(([left], [right]) => left.localeCompare(right)));
}

function groupByTime(docs: ContentDoc[]) {
  const map = new Map<string, ContentDoc[]>();
  for (const doc of docs) {
    for (const time of doc.timePeriods) {
      const bucket = map.get(time) ?? [];
      bucket.push(doc);
      map.set(time, bucket);
    }
  }
  return new Map(Array.from(map.entries()).sort(([left], [right]) => timeLabelSort(left, right)));
}

function groupByFolder(docs: ContentDoc[]) {
  const map = new Map<string, ContentDoc[]>();
  for (const doc of docs) {
    const folder = doc.relPath.includes('/') ? doc.relPath.split('/').slice(0, -1).join('/') : 'root';
    const bucket = map.get(folder) ?? [];
    bucket.push(doc);
    map.set(folder, bucket);
  }
  return new Map(Array.from(map.entries()).sort(([left], [right]) => left.localeCompare(right)));
}

function groupBySummaryFolder(docs: ContentDoc[]) {
  const sourceDocs = docs.filter((doc) => ['reference', 'divergence', 'lore', 'story'].includes(doc.layerCategory));
  const grouped = groupByFolder(sourceDocs);
  return new Map(Array.from(grouped.entries()).filter(([, folderDocs]) => folderDocs.length >= 2));
}

function canonIndexSection(doc: ContentDoc) {
  if (doc.layerCategory === 'reference') return 'Reference Baseline';
  if (doc.layerCategory === 'divergence') return 'Divergences';
  if (doc.layerCategory === 'story') return 'Stories';
  if (doc.status === 'Canon') return 'Canon';
  if (doc.status === 'Canon Candidate') return 'Canon Candidates';
  if (doc.status === 'Draft') return 'Draft Systems';
  return 'Unstated Status';
}

function appendAtomicNotes(lines: string[], docs: ContentDoc[]) {
  const docsWithNotes = docs.filter((doc) => doc.atomicNotes.length > 0);
  lines.push('## Key Atomic Notes', '');
  if (docsWithNotes.length === 0) {
    lines.push('No atomic notes found.', '');
    return;
  }

  for (const doc of docsWithNotes) {
    lines.push(`### ${doc.title}`, '');
    for (const note of doc.atomicNotes) {
      lines.push(`- ${note}`);
    }
    lines.push('');
  }
}

function appendOpenQuestions(lines: string[], docs: ContentDoc[]) {
  const docsWithQuestions = docs.filter((doc) => doc.openQuestions.length > 0);
  lines.push('## Open Questions', '');
  if (docsWithQuestions.length === 0) {
    lines.push('No open questions found.', '');
    return;
  }

  for (const doc of docsWithQuestions) {
    lines.push(`### ${doc.title}`, '');
    for (const question of doc.openQuestions) {
      lines.push(`- ${question}`);
    }
    lines.push('');
  }
}

function appendRelatedDocuments(lines: string[], docs: ContentDoc[], sourcePage: string) {
  const links: string[] = [];
  for (const doc of docs) {
    for (const related of doc.relatedDocs) {
      const target = resolveLocalHref(doc.relPath, related.href);
      if (!target) {
        continue;
      }
      links.push(`- ${markdownLink(related.text, repoRelativeLink(sourcePage, target))}`);
    }
  }

  const uniqueLinks = uniqueStrings(links).sort((a, b) => a.localeCompare(b));
  lines.push('## Related Documents', '');
  if (uniqueLinks.length === 0) {
    lines.push('No related documents found.', '');
    return;
  }
  lines.push(...uniqueLinks, '');
}

function appendRelatedTopics(lines: string[], currentTopic: string, docs: ContentDoc[]) {
  const topics = uniqueStrings(docs.flatMap((doc) => doc.topics).filter((topic) => topic !== currentTopic)).sort((a, b) => a.localeCompare(b));
  lines.push('## Related Topics', '');
  if (topics.length === 0) {
    lines.push('No related topics found.', '');
    return;
  }

  for (const topic of topics) {
    lines.push(`- ${topic}`);
  }
  lines.push('');
}

function uniqueDocs(docs: ContentDoc[]) {
  const seen = new Set<string>();
  const result: ContentDoc[] = [];
  for (const doc of docs) {
    if (seen.has(doc.relPath)) {
      continue;
    }
    seen.add(doc.relPath);
    result.push(doc);
  }
  return result;
}

function resolveLocalHref(sourceRelPath: string, href: string) {
  if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return null;
  }
  const [targetPathPart] = href.split('#');
  if (!targetPathPart) {
    return sourceRelPath;
  }
  return toPosix(path.posix.normalize(path.posix.join(path.posix.dirname(sourceRelPath), targetPathPart)));
}

function inferTopicFromDocument(relPath: string, title: string, metadata: Map<string, string[]>) {
  const explicitPrimary = firstValue(metadata, 'Primary topic');
  if (explicitPrimary) {
    return explicitPrimary;
  }

  const explicitTopics = listValue(metadata, 'Topics');
  if (explicitTopics.length > 0) {
    return explicitTopics[0];
  }

  if (relPath.startsWith('reference/') || relPath.startsWith('lore/')) {
    return title;
  }

  return null;
}

function displayTopicLabel(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return trimmed;
  }

  if (/[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed) && trimmed !== trimmed.toLowerCase()) {
    return trimmed;
  }

  return trimmed.replace(/(^|[\s-])([a-z0-9])/g, (_, prefix: string, char: string) => `${prefix}${char.toUpperCase()}`);
}

function inferLayerCategory(relPath: string, layerRaw: string | null): LayerCategory {
  if (relPath.startsWith('reference/')) {
    return 'reference';
  }
  if (relPath.startsWith('lore/divergences/')) {
    return 'divergence';
  }
  if (relPath.startsWith('lore/')) {
    return 'lore';
  }
  if (relPath.startsWith('stories/')) {
    return 'story';
  }
  if (layerRaw) {
    const normalized = normalizeKey(layerRaw);
    if (normalized.includes('reference')) return 'reference';
    if (normalized.includes('divergence')) return 'divergence';
    if (normalized.includes('story')) return 'story';
    if (normalized.includes('system') || normalized.includes('lore')) return 'lore';
  }
  return 'foundation';
}

function inferLayerRawFromPath(relPath: string) {
  if (relPath.startsWith('reference/')) return 'Real-world reference';
  if (relPath.startsWith('lore/divergences/')) return 'Fundamental divergence';
  if (relPath.startsWith('lore/')) return 'Cassowary World system';
  if (relPath.startsWith('stories/')) return 'Story';
  return 'Foundation';
}

function layerDisplayName(layerCategory: LayerCategory) {
  switch (layerCategory) {
    case 'foundation':
      return 'Foundation';
    case 'reference':
      return 'Reference';
    case 'divergence':
      return 'Divergences';
    case 'lore':
      return 'Lore';
    case 'story':
      return 'Stories';
  }
}

function layerSortOrder(layer: string) {
  const index = ['foundation', 'reference', 'divergence', 'lore', 'story'].indexOf(layer);
  return index === -1 ? 99 : index;
}

function timeLabelSort(left: string, right: string) {
  const leftIndex = ALLOWED_TIME_LABELS.findIndex((label) => normalizeKey(label) === normalizeKey(left));
  const rightIndex = ALLOWED_TIME_LABELS.findIndex((label) => normalizeKey(label) === normalizeKey(right));
  return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex) || left.localeCompare(right);
}

function sortDocs(left: ContentDoc, right: ContentDoc) {
  return left.title.localeCompare(right.title) || left.relPath.localeCompare(right.relPath);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function listValue(metadata: Map<string, string[]>, label: string) {
  return metadata.get(label)?.flatMap((value) => splitMultiValue(value)) ?? [];
}

function firstValue(metadata: Map<string, string[]>, label: string) {
  return metadata.get(label)?.find((value) => value.trim().length > 0)?.trim() ?? null;
}

function hasLabel(metadata: Map<string, string[]>, label: string) {
  return metadata.has(label);
}

function splitMultiValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const codeMatches = Array.from(trimmed.matchAll(/`([^`]+)`/g)).map((match) => match[1].trim()).filter(Boolean);
  if (codeMatches.length > 0) {
    return codeMatches;
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMetadataLine(line: string) {
  const match = line.match(/^\s*[-*]?\s*([A-Za-z][A-Za-z0-9 /()-]+):\s*(.+?)\s*$/);
  if (!match) {
    return null;
  }

  const label = canonicalMetadataLabel(match[1].trim());
  const rawValue = match[2].trim();
  const values = LIST_METADATA_LABELS.has(label) ? splitMultiValue(rawValue) : [rawValue];
  return { label, values };
}

function canonicalMetadataLabel(label: string) {
  const normalized = normalizeKey(label);
  return METADATA_LABEL_CANONICAL.get(normalized) ?? label.replace(/\s+/g, ' ').trim();
}

function normalizeSectionName(value: string) {
  return normalizeKey(value);
}

function extractFirstParagraph(lines: string[]) {
  const chunks: string[] = [];
  let active = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (active) {
        break;
      }
      continue;
    }
    if (trimmed.startsWith('#')) {
      break;
    }
    if (trimmed.startsWith('- ') && active && chunks.length > 0) {
      break;
    }
    active = true;
    chunks.push(line);
  }
  return chunks.join('\n').trim();
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractBullets(lines: string[]) {
  const bullets: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*[-*]\s+(.*)$/);
    if (match) {
      bullets.push(match[1].trim());
    }
  }
  return bullets;
}

function extractRelatedDocuments(lines: string[]) {
  const docs: LinkRef[] = [];
  for (const line of lines) {
    const links = extractLinks(line);
    for (const link of links) {
      docs.push(link);
    }
  }
  return docs;
}

function extractLinks(text: string) {
  const links: LinkRef[] = [];
  const lines = text.split(/\r?\n/);
  let inFence = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMatch = line.trim().match(/^(```|~~~)/);
    if (fenceMatch) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }

    const regex = /(!)?\[([^\]]+)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(line))) {
      if (match[1] === '!') {
        continue;
      }
      links.push({
        text: match[2].trim(),
        href: match[3].trim(),
        line: index + 1,
      });
    }
  }
  return links;
}

function validateLink(sourceRelPath: string, href: string) {
  if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return [];
  }

  const [targetPathPart, fragmentPart] = href.split('#');
  const resolvedTarget = targetPathPart
    ? toPosix(path.posix.normalize(path.posix.join(path.posix.dirname(sourceRelPath), targetPathPart)))
    : sourceRelPath;

  const absoluteTarget = path.join(ROOT_DIR, resolvedTarget);
  if (resolvedTarget.startsWith('generated/')) {
    return [];
  }

  if (!existsSync(absoluteTarget)) {
    return [{
      severity: 'error' as Severity,
      code: 'broken-link',
      message: `Broken local link target: ${href} -> ${resolvedTarget}`,
    }];
  }

  if (!fragmentPart) {
    return [];
  }

  const fragmentAnchor = headingToAnchor(fragmentPart.replace(/^#/, ''));
  if (!fragmentAnchor) {
    return [];
  }

  const sourceText = readFileSync(absoluteTarget, 'utf8');
  const anchors = new Set(
    sourceText
      .split(/\r?\n/)
      .map((line) => line.match(/^(#{1,6})\s+(.*)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => headingToAnchor(match[2].trim())),
  );

  if (!anchors.has(fragmentAnchor)) {
    return [{
      severity: 'error' as Severity,
      code: 'broken-link-anchor',
      message: `Broken local link anchor: ${href} -> ${resolvedTarget}#${fragmentPart}`,
    }];
  }

  return [];
}

async function ensureDir(absPath: string) {
  await fs.mkdir(absPath, { recursive: true });
}

async function exists(absPath: string) {
  try {
    await fs.access(absPath);
    return true;
  } catch {
    return false;
  }
}

async function readIfExists(absPath: string) {
  try {
    return await fs.readFile(absPath, 'utf8');
  } catch {
    return null;
  }
}

async function listGeneratedMarkdownFiles() {
  const files: string[] = [];

  async function walk(dir: string) {
    if (!(await exists(dir))) {
      return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(absPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(absPath);
      }
    }
  }

  await walk(GENERATED_DIR);
  return files;
}

function formatIssue(issue: ValidationIssue) {
  const location = issue.path ? `${issue.path}: ` : '';
  return `${location}${issue.message} [${issue.code}]`;
}

function renderTable(headers: string[], rows: string[][]) {
  const normalizedRows = rows.length > 0 ? rows : [[...headers.map(() => 'No entries found')]];
  const widths = headers.map((header, index) => {
    const cellWidths = normalizedRows.map((row) => (row[index] ?? '').length);
    return Math.max(header.length, ...cellWidths);
  });
  const renderRow = (cells: string[]) => `| ${cells.map((cell, index) => padCell(cell, widths[index])).join(' | ')} |`;
  const separator = `| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`;
  return [
    renderRow(headers),
    separator,
    ...rows.map((row) => renderRow(row)),
  ].join('\n');
}

function padCell(value: string, width: number) {
  return value + ' '.repeat(Math.max(0, width - value.length));
}

function markdownLink(text: string, href: string) {
  return `[${text}](${href})`;
}

function repoRelativeLink(fromRelPath: string, targetRelPath: string) {
  return toPosix(path.posix.relative(path.posix.dirname(fromRelPath), targetRelPath));
}

function escapeCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function shortSummary(summary: string) {
  const text = summary.replace(/\s+/g, ' ').trim();
  if (text.length <= 120) {
    return text;
  }
  return `${text.slice(0, 117).trimEnd()}...`;
}

function formatInlineList(values: string[]) {
  return values.length > 0 ? values.join(', ') : '';
}

function headingToAnchor(text: string) {
  return normalizeKey(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeKey(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value: string, preserveLeadingTilde: boolean) {
  let slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9~]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!preserveLeadingTilde) {
    slug = slug.replace(/^~+/, '');
  }

  return slug || 'index';
}

function inferTitleFromPath(relPath: string) {
  const stem = relPath.split('/').pop()?.replace(/\.md$/, '') ?? relPath;
  return stem
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function toPosix(value: string) {
  return value.split(path.sep).join('/');
}

function findDuplicateLabels(entries: Array<{ label: string }>) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const entry of entries) {
    const key = normalizeKey(entry.label);
    if (seen.has(key)) {
      duplicates.add(entry.label);
    }
    seen.add(key);
  }
  return Array.from(duplicates);
}

function canonicalLabelComparison(label: string) {
  return normalizeKey(label);
}

async function compareOrWriteFile(absPath: string, content: string) {
  const current = await readIfExists(absPath);
  if (current !== content) {
    await ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, content, 'utf8');
  }
}

function renderValidationReportSummary(issues: ValidationIssue[]) {
  const errors = issues.filter((issue) => issue.severity === 'error').length;
  const warnings = issues.filter((issue) => issue.severity === 'warning').length;
  return { errors, warnings };
}

function validateAnchorPresence(targetRelPath: string, fragment: string) {
  const normalizedFragment = fragment.replace(/^#/, '');
  if (!normalizedFragment) {
    return [];
  }
  return [];
}

function parseTitleFromLines(lines: string[]) {
  for (const line of lines) {
    const match = line.match(/^#\s+(.*)$/);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}

function isPathLikeLinkTarget(target: string) {
  return target.includes('/') || target.endsWith('.md');
}

function canonicalizeStatus(status: string | null) {
  return status ? status.trim() : 'Unstated';
}

async function writeGeneratedReadmeIfNeeded() {
  await ensureDir(GENERATED_DIR);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
