import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { normalizeSkill } from '../src/utils/match/skills/skill.utils.js';

/* ── Config ───────────────────────────────────────────────────────────────── */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, 'data', 'input');
const inputFiles = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith('.csv'));

if (inputFiles.length === 0) {
  throw new Error(`No CSV files found in ${INPUT_DIR}/`);
}

const sortedInputFiles = [...inputFiles].sort();
const latestInputFile = sortedInputFiles[sortedInputFiles.length - 1];

if (latestInputFile === undefined) {
  throw new Error(`No CSV files found in ${INPUT_DIR}/`);
}

if (inputFiles.length > 1) {
  console.warn(`Multiple CSVs found in ${INPUT_DIR}/, using the most recent: ${latestInputFile}`);
}

const OUTPUT_FILE = path.join(__dirname, 'data', 'output', 'skillAliases.ts');
const REVIEW_FILE = path.join(__dirname, 'data', 'output', 'aliasesNeedsReview.ts');

// Canonical targets that are too dangerous to auto-accept regardless of alias.
// "google-publisher-tag" is the critical one: its SO synonym is "gpt", which
// collides with the AI model family name — a false match here would be a
// severe, silent corruption of any CV/job mentioning GPT models.
const EXCLUDE_CANONICAL = new Set(['google-publisher-tag', 'program-entry-point']);

// SO's own internal placeholders for typo'd/deprecated tags (e.g.
// "do-not-use-typo-in-tag", "do-not-use-tag-stars"). These aren't real
// skills at all — matching against them would produce a canonical entry
// that's meaningless by construction. Matched as a substring since SO
// appends the original tag name after the "do-not-use..." prefix.
const EXCLUDE_CANONICAL_PATTERNS = [/^do-?not-?use/];

// Aliases too short to trust as an automatic full-credit skill match
// regardless of what they're paired with — every genuine collision risk
// found in the dataset so far (if, os, db, ce, ai, ui, int, new, man) is
// 2-3 characters. Route to review rather than silently accept or reject.
const MIN_ALIAS_LENGTH = 4;

// Aliases that are too generic/common as standalone English words to trust
// as an automatic full-credit skill match, regardless of what they're paired
// with. These get routed to review instead of silently dropped. (Mostly
// superseded by MIN_ALIAS_LENGTH now, but kept for words ≥4 chars that are
// still risky, e.g. "main", "wording", "compliant".)
const EXCLUDE_GENERIC_ALIASES = new Set([
  'main',
  'gpt',
  'globals',
  'rows',
  'hints',
  'optional',
  'maybe',
  'seq',
  'scatter',
  'args',
  'wording',
  'compliant',
  'thread',
  'threads',
]);

// Common-word blocklist for the SECOND PASS (see below): after short/generic
// aliases are collected into needsReview, everything in this set STAYS in
// review permanently. Everything else in needsReview gets auto-promoted into
// SKILL_ALIASES, on the reasoning that most short tech acronyms (bdb, cte,
// tpl, ast, iam, llm, rag, ...) carry low real-world collision risk, while
// this specific list of plain English words does not. Maintain this list by
// hand as new false-positive-prone words are discovered — it's the one
// piece of this pipeline that stays a manual judgment call by design.
const COMMON_WORD_BLOCKLIST = new Set([
  'www',
  'db',
  'os',
  'def',
  'str',
  'img',
  'dir',
  'int',
  'new',
  'man',
  'avg',
  'job',
  'tag',
  'log',
  'py',
  'add',
  'map',
  'pos',
  'ms',
  'tab',
  'cs',
  'tv',
  'div',
  'htm',
  'cin',
  'if',
  'else',
  'elseif',
  'ce',
  'ai',
  'ui',
  'gui',
  'main',
  'gpt',
  'wording',
  'compliant',
  'maybe',
  'optional',
]);

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function getOrCreate<T>(map: Map<string, T[]>, key: string): T[] {
  let list = map.get(key);
  if (!list) {
    list = [];
    map.set(key, list);
  }
  return list;
}

function pushUnique<T>(list: T[], value: T): void {
  if (!list.includes(value)) list.push(value);
}

/* ── Parse ────────────────────────────────────────────────────────────────── */

const INPUT_CSV = path.join(INPUT_DIR, latestInputFile);

const rawRows: string[][] = parse(fs.readFileSync(INPUT_CSV, 'utf-8'), {
  columns: false,
  skip_empty_lines: true,
  relax_column_count: true,
});

// Drop a leading header row if present (e.g. "SourceTagName,TargetTagName").
// Detected by checking whether the first row's normalized cells match the
// known header names, rather than blindly slicing off row 0 — this way the
// script still works unmodified against header-less exports too.
const HEADER_MARKERS = new Set(['sourcetagname', 'targettagname']);
const firstRow = rawRows[0];
const firstRowLooksLikeHeader =
  firstRow !== undefined && firstRow.every((cell) => HEADER_MARKERS.has(normalizeSkill(cell)));

const rows = firstRowLooksLikeHeader ? rawRows.slice(1) : rawRows;

const SKILL_ALIASES = new Map<string, string[]>();
const needsReview = new Map<string, string[]>();

let acceptedCount = 0;
let skippedEmpty = 0;
let skippedExcludedCanonical = 0;
let skippedDoNotUsePattern = 0;
let skippedShortAlias = 0;
let skippedGenericAlias = 0;

for (const row of rows) {
  if (row.length < 2) {
    skippedEmpty++;
    continue;
  }

  const [sourceTag, targetTag] = row;
  const canonical = normalizeSkill(targetTag ?? '');
  const alias = normalizeSkill(sourceTag ?? '');

  if (!canonical || !alias || alias === canonical) {
    skippedEmpty++;
    continue;
  }

  if (EXCLUDE_CANONICAL.has(canonical)) {
    skippedExcludedCanonical++;
    pushUnique(getOrCreate(needsReview, canonical), alias);
    continue;
  }

  if (EXCLUDE_CANONICAL_PATTERNS.some((pattern) => pattern.test(canonical))) {
    skippedDoNotUsePattern++;
    // Not routed to review — these are SO's own "not a real tag" placeholders,
    // not a judgment call, so there's nothing for a human to weigh in on.
    continue;
  }

  if (alias.length < MIN_ALIAS_LENGTH) {
    skippedShortAlias++;
    pushUnique(getOrCreate(needsReview, canonical), alias);
    continue;
  }

  if (EXCLUDE_GENERIC_ALIASES.has(alias)) {
    skippedGenericAlias++;
    pushUnique(getOrCreate(needsReview, canonical), alias);
    continue;
  }

  pushUnique(getOrCreate(SKILL_ALIASES, canonical), alias);
  acceptedCount++;
}

/* ── Second pass: auto-promote non-blocklisted review entries ───────────── */
// Anything routed to needsReview above (short aliases, EXCLUDE_GENERIC_ALIASES
// hits) gets re-examined here. Aliases NOT in COMMON_WORD_BLOCKLIST are
// promoted into SKILL_ALIASES; only genuine common-English-word collisions
// remain in the final review file.

const finalNeedsReview = new Map<string, string[]>();
let autoPromotedCount = 0;

for (const [canonical, aliases] of needsReview) {
  for (const alias of aliases) {
    if (COMMON_WORD_BLOCKLIST.has(alias)) {
      pushUnique(getOrCreate(finalNeedsReview, canonical), alias);
    } else {
      pushUnique(getOrCreate(SKILL_ALIASES, canonical), alias);
      autoPromotedCount++;
    }
  }
}

/* ── Write output ─────────────────────────────────────────────────────────── */

const skillAliasesObj = Object.fromEntries(SKILL_ALIASES);
const needsReviewObj = Object.fromEntries(finalNeedsReview);

fs.writeFileSync(
  OUTPUT_FILE,
  `export const SKILL_ALIASES: Record<string, string[]> = ${JSON.stringify(
    skillAliasesObj,
    null,
    2,
  )};\n`,
);

fs.writeFileSync(
  REVIEW_FILE,
  `export const NEEDS_REVIEW: Record<string, string[]> = ${JSON.stringify(
    needsReviewObj,
    null,
    2,
  )};\n`,
);

console.log(
  `Accepted (first pass): ${acceptedCount} aliases across ${SKILL_ALIASES.size} canonical skills\n` +
    `Auto-promoted (second pass, non-blocklisted): ${autoPromotedCount}\n` +
    `Final needs review (blocklisted common words only): ${finalNeedsReview.size} canonical skills\n` +
    `Skipped (empty/self-match): ${skippedEmpty}\n` +
    `Skipped (excluded canonical, routed to review): ${skippedExcludedCanonical}\n` +
    `Skipped (do-not-use SO placeholder, discarded): ${skippedDoNotUsePattern}\n` +
    `Skipped (alias < ${MIN_ALIAS_LENGTH} chars, routed to review): ${skippedShortAlias}\n` +
    `Skipped (generic alias, routed to review): ${skippedGenericAlias}`,
);
