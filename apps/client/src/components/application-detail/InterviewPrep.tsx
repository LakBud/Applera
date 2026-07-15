import { Lightbulb, Loader2 } from 'lucide-react';

import { useGenerateInterviewPrep, useInterviewPrep } from '../../api';
import { ApplicationAccordion } from '../ui/accordion';
import { Button } from '../ui/button';
import { SectionHeading } from '../ui/section';

export function InterviewPrepSection({ applicationId }: { applicationId: string }) {
  const { data: prep, isLoading } = useInterviewPrep(applicationId);
  const { mutate: generate, isPending } = useGenerateInterviewPrep();

  const hasNoPrep = !prep && !isLoading;

  if (isLoading) {
    return (
      <ApplicationAccordion title="Interview preparation">
        <div className="p-4 sm:p-5 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3.5 bg-muted animate-pulse rounded w-full" />
          ))}
        </div>
      </ApplicationAccordion>
    );
  }

  if (hasNoPrep) {
    return (
      <ApplicationAccordion title="Interview preparation">
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          <p className="text-sm text-tx-muted leading-relaxed">No interview prep generated yet.</p>

          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => generate(applicationId)}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
                Generate prep
              </>
            )}
          </Button>
        </div>
      </ApplicationAccordion>
    );
  }

  if (!prep) {
    return null;
  }

  return (
    <ApplicationAccordion title="Interview preparation">
      <div className="p-4 sm:p-5 space-y-8">
        {Object.entries(
          prep.parsed.questions.reduce<Record<string, typeof prep.parsed.questions>>((acc, q) => {
            acc[q.category] = [...(acc[q.category] ?? []), q];
            return acc;
          }, {}),
        ).map(([category, questions]) => (
          <div key={category} className="space-y-3">
            <SectionHeading>{category}</SectionHeading>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="
                    border border-border rounded-lg
                    p-3 sm:p-4
                    space-y-2
                    bg-surface-muted
                  "
                >
                  <p className="text-sm font-medium text-tx-body leading-snug wrap-break-words">
                    {q.question}
                  </p>
                  <p className="text-xs text-tx-muted leading-relaxed wrap-break-words">{q.tip}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {prep.parsed?.general_tips.length > 0 && (
          <div className="space-y-3">
            <SectionHeading>General tips</SectionHeading>

            <ul className="space-y-2">
              {prep.parsed?.general_tips.map((tip, i) => (
                <li key={i} className="text-xs sm:text-sm text-tx-muted flex gap-2 leading-relaxed">
                  <span className="mt-1 shrink-0 text-tx-caption">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ApplicationAccordion>
  );
}
