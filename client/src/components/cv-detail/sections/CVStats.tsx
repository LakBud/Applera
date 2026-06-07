import { CVCompletenessBar } from "../stats/CVCompleteBar";
import { CVStats } from "../stats/CVStats";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <CVStats successRate={successRate} totalApplications={totalApplications} avgScore={avgScore} bestScore={bestScore} />

      <CVCompletenessBar completeness={completeness} missing={missing} />
    </div>
  );
}
