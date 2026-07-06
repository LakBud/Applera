# Scripts

One-off data-import scripts. These run standalone via `tsx`, separate from
the application's normal build — they are not imported by anything in `src/`.

## buildSkillAliases.ts

Converts Stack Overflow's tag-synonym data into the `SKILL_ALIASES` format
used by `src/utils/match/skill_aliases.ts` for skill-equivalence matching
(see `src/utils/match/skill.utils.ts`).

### Source data

Pulled from the Stack Exchange Data Explorer:
https://data.stackexchange.com/stackoverflow/query/new

```sql
SELECT SourceTagName, TargetTagName
FROM TagSynonyms
```

Export as CSV, save as `scripts/data/sources/stackoverflow-tag-synonyms-<date>.csv`
(dated so old pulls aren't silently overwritten).

Re-pull periodically — SO approves new tag synonyms over time — and re-run
the script to pick up additions. Diff the generated output against what's
currently merged into `skill_aliases.ts` to see what's new.

### Filtering logic

The script does NOT trust the raw data as-is. Skill-equivalence entries are
full-credit, no-partial-scoring matches (see comment in `skill.utils.ts`) —
a wrong entry silently corrupts every future match involving that skill, so
the following safeguards are applied before anything is auto-accepted:

- **Header row detection** — the CSV includes a header row; detected and
  skipped automatically (works with header-less exports too).
- **`EXCLUDE_CANONICAL`** — canonical targets too dangerous to ever accept,
  regardless of alias (e.g. `google-publisher-tag`, whose SO alias `gpt`
  collides with the AI model family name).
- **`EXCLUDE_CANONICAL_PATTERNS`** — filters out SO's own internal
  "do-not-use" typo/deprecation placeholders, which aren't real skills.
- **`MIN_ALIAS_LENGTH`** — aliases under 4 characters are routed to review
  rather than auto-accepted or auto-rejected, since every genuine collision
  risk found in this dataset (`if`, `os`, `db`, `ce`, `ai`, `ui`, `int`,
  `new`, `man`) has been 2-3 characters long.
- **Second-pass auto-promotion** — short/flagged aliases are re-checked
  against `COMMON_WORD_BLOCKLIST`, a small hand-maintained list of plain
  English words too risky to trust as full-credit matches (`db`, `os`,
  `www`, `str`, `main`, `wording`, `compliant`, etc.). Anything NOT in this
  blocklist is promoted automatically, since most short tech acronyms
  (`bdb`, `cte`, `tpl`, `iam`, `llm`, `rag`, ...) carry low real-world
  collision risk. `COMMON_WORD_BLOCKLIST` is the one part of this pipeline
  that stays a manual judgment call by design — extend it by hand as new
  false-positive-prone words are discovered.

### Output

- `scripts/data/output/skillAliases.ts` — auto-accepted aliases.
  Skim before merging into production; not a substitute for review, just a
  much smaller set to review.
- `scripts/data/output/aliasesNeedsReview.ts` — permanently-excluded
  common-word collisions. Expected to stay small and fairly stable across
  re-runs; if it suddenly grows a lot, something in the source data or
  filters likely changed and deserves a look before merging anything.

### Running

On server root:

```bash
pnpm data:build-so-aliases
```

### Merging into production

`skillAliases.ts` is NOT imported directly by the application. After
reviewing its contents, manually merge approved entries into
`src/utils/match/skill/skill.aliases.ts`, which is the actual file consumed at
runtime by `skill.utils.ts`.
