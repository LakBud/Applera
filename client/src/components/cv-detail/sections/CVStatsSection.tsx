import { CVCompletenessBar } from "../CVCompleteBar";
import { CVStats } from "../CVStats";

type Props = {
  successRate: number;
  totalApplications: number;
  avgScore: number;
  bestScore: number;
  completeness: number;
  missing: string[];
};

export function CVStatsSection({ successRate, totalApplications, avgScore, bestScore, completeness, missing }: Props) {
  return (
    <section className="flex flex-col md:flex-row items-stretch gap-8">
      {/* Performance */}
      <div className="flex-1 min-w-0">
        <CVStats successRate={successRate} totalApplications={totalApplications} avgScore={avgScore} bestScore={bestScore} />
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-border/50" />

      {/* Completeness */}
      <div className="flex-1 min-w-0">
        <CVCompletenessBar completeness={completeness} missing={missing} />
      </div>
    </section>
  );
}
