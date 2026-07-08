import { useState } from 'react';

import { Tabs } from '../../ui/tabs';
import { ApplicationScorePanel } from './ApplicationScorePanel';
import { ApplicationTabContent } from './ApplicationTabsContent';
import { ApplicationTabsHeader } from './ApplicationTabsHeader';

import type { Application } from '@applera/schemas';

type Props = {
  data: Application;
};

export default function ApplicationResult({ data: application }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'letter' | 'advice' | 'email'>('letter');

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const score = application.match?.score ?? 0;
  const scoreColor =
    score >= 80
      ? 'text-tx-h1' // #1fa028 — bright green (strong match)
      : score >= 60
        ? 'text-tx-h3' // #166534 — mid green (good match)
        : score >= 40
          ? 'text-tx-secondary' // #3d5a45 — muted green (moderate match)
          : 'text-tx-muted'; // weak match

  const barColor =
    score >= 80
      ? 'bg-[#1fa028]'
      : score >= 60
        ? 'bg-[#166534]'
        : score >= 40
          ? 'bg-[#3d5a45]'
          : 'bg-[#6b7280]';

  const activeContent = {
    advice: application.tailoring_advice,
    letter: application.cover_letter,
    email: `Subject: ${application.application_email?.subject}\n\n${application.application_email?.body}`,
  }[activeTab];

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-lg bg-white/70">
      {/* ── Window chrome bar ── */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-muted">
        <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[300px_1fr]">
        <ApplicationScorePanel
          score={score}
          scoreColor={scoreColor}
          barColor={barColor}
          recommendation={application.match?.recommendation}
          strengths={application.match?.strengths}
          missingSkills={application.match?.missing_skills}
          seniorityFit={application.match?.seniority_fit}
          domainMismatch={application.match?.domain_mismatch}
        />

        {/* ══════════════════════════════════
            RIGHT PANEL — TABS
        ══════════════════════════════════ */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex flex-col"
        >
          <ApplicationTabsHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            copy={copy}
            copied={copied}
            activeContent={activeContent}
          />

          <ApplicationTabContent activeTab={activeTab} application={application} />
        </Tabs>
      </div>
    </div>
  );
}
