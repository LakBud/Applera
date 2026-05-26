import { useMemo } from "react";
import type { CVDocument } from "../../api/schemas";
import { CV_COMPLETENESS_RULES } from "../../utils/cv-id/rules";

type Result = {
  completeness: number;
  missing: string[];
};

export function useCVCompleteness(cv?: CVDocument): Result {
  return useMemo(() => {
    if (!cv?.parsed) {
      return {
        completeness: 0,
        missing: ["Summary", "Skills", "Experience", "Education", "Projects"],
      };
    }

    const parsed = cv.parsed;

    const checks = CV_COMPLETENESS_RULES.map((rule) => {
      const done =
        rule.key === "summary"
          ? Boolean(parsed.summary?.trim())
          : rule.key === "skills"
            ? parsed.skills.length > 0
            : rule.key === "experience"
              ? parsed.experience.length > 0
              : rule.key === "education"
                ? parsed.education.length > 0
                : (parsed.projects?.length ?? 0) > 0;

      return {
        label: rule.label,
        weight: rule.weight,
        done,
      };
    });

    const completeness = checks.reduce((acc, item) => acc + (item.done ? item.weight : 0), 0);

    const missing = checks.filter((c) => !c.done).map((c) => c.label);

    return {
      completeness,
      missing,
    };
  }, [cv]);
}
