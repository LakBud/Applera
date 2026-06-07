import { Lightbulb, Loader2 } from "lucide-react";
import { useGenerateInterviewPrep, useInterviewPrep } from "../../api";
import { Button } from "../ui/button";
import { ApplicationAccordion } from "../ui/accordion";
import { SectionHeading } from "../ui/section";

export function InterviewPrepSection({ applicationId }: { applicationId: string }) {
  const { data: prep, isLoading } = useInterviewPrep(applicationId);
  const { mutate: generate, isPending } = useGenerateInterviewPrep();

  const hasNoPrep = !prep && !isLoading;

  if (isLoading) {
    return (
      <ApplicationAccordion title="Interview preparation">
        <div className="p-4 space-y-2">
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
        <div className="p-4 flex flex-col items-start gap-3">
          <p className="text-sm text-tx-muted">No interview prep generated yet.</p>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => generate(applicationId)}>
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

  if (!prep) return null;

  return (
    <ApplicationAccordion title="Interview preparation">
      <div className="p-4 space-y-6">
        {Object.entries(
          prep.questions.reduce<Record<string, typeof prep.questions>>((acc, q) => {
            acc[q.category] = [...(acc[q.category] ?? []), q];
            return acc;
          }, {}),
        ).map(([category, questions]) => (
          <div key={category}>
            <SectionHeading>{category}</SectionHeading>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-1.5 bg-surface-muted">
                  <p className="text-sm font-medium text-tx-body">{q.question}</p>
                  <p className="text-xs text-tx-muted">{q.tip}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {prep.general_tips.length > 0 && (
          <div>
            <SectionHeading>General tips</SectionHeading>
            <ul className="space-y-1.5">
              {prep.general_tips.map((tip, i) => (
                <li key={i} className="text-xs text-tx-muted flex gap-2">
                  <span className="mt-0.5 shrink-0 text-tx-caption">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button size="sm" variant="outline" disabled={isPending} onClick={() => generate(applicationId)}>
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
              Regenerate
            </>
          )}
        </Button>
      </div>
    </ApplicationAccordion>
  );
}
