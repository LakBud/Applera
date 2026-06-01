import { Lightbulb, Loader2, MessageSquare } from "lucide-react";
import { useGenerateInterviewPrep, useInterviewPrep } from "../../api";
import { Button } from "../ui/button";
import { Section } from "../common/Section";

export function InterviewPrepSection({ applicationId }: { applicationId: string }) {
  const { data: prep, isLoading, isError } = useInterviewPrep(applicationId);
  const { mutate: generate, isPending } = useGenerateInterviewPrep();

  if (isLoading) {
    return (
      <Section title="Interview prep">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-3.5 bg-muted animate-pulse rounded w-full" />
          ))}
        </div>
      </Section>
    );
  }

  if (!prep || isError) {
    return (
      <Section title="Interview prep">
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">No interview prep generated yet.</p>
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
      </Section>
    );
  }

  return (
    <Section title="Interview prep">
      <div className="space-y-6">
        {/* Questions grouped by category */}
        {Object.entries(
          prep.questions.reduce<Record<string, typeof prep.questions>>((acc, q) => {
            acc[q.category] = [...(acc[q.category] ?? []), q];
            return acc;
          }, {}),
        ).map(([category, questions]) => (
          <div key={category}>
            <div className="flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{category}</p>
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="border border-border p-3 space-y-1.5">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-muted-foreground">{q.tip}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* General tips */}
        {prep.general_tips.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">General tips</p>
            </div>
            <ul className="space-y-1.5">
              {prep.general_tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="mt-0.5 shrink-0">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Regenerate */}
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
    </Section>
  );
}
