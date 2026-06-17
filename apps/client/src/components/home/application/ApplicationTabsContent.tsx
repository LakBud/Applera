import type { Application } from '@/api/application/application.schemas';

type Props = {
  activeTab: 'letter' | 'summary' | 'email';
  application: Application;
};

export function ApplicationTabContent({ activeTab, application }: Props) {
  const content = {
    letter: (
      <pre className="whitespace-pre-wrap text-sm text-tx-body leading-relaxed">
        {application.cover_letter}
      </pre>
    ),

    summary: (
      <pre className="whitespace-pre-wrap text-sm text-tx-body leading-relaxed">
        {application.tailored_cv_summary}
      </pre>
    ),

    email: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <span className="text-xs text-caption w-14">Subject</span>
          <span className="text-sm text-tx-body font-medium">
            {application.application_email?.subject}
          </span>
        </div>

        <pre className="whitespace-pre-wrap text-sm text-tx-body leading-relaxed">
          {application.application_email?.body}
        </pre>
      </div>
    ),
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto max-h-[60vh] md:max-h-120 mt-0">
      {content[activeTab]}
    </div>
  );
}
