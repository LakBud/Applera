import { useMemo } from 'react';

import type { CVDocument } from '@repo/schemas';

import { CV_COMPLETENESS_RULES } from '../../utils/cv-id/rules';

type Result = {
  completeness: number;
  missing: string[];
};

export function useCVCompleteness(cv?: CVDocument): Result {
  return useMemo(() => {
    if (!cv?.parsed) {
      return {
        completeness: 0,
        missing: ['Summary', 'Skills', 'Experience', 'Education'],
      };
    }

    const parsed = cv.parsed;

    const checks = [
      {
        label: 'Skills',
        weight: CV_COMPLETENESS_RULES.find((r) => r.key === 'skills')!.weight,
        done: parsed.skills.length > 0,
      },
      {
        label: 'Experience',
        weight: CV_COMPLETENESS_RULES.find((r) => r.key === 'experience')!.weight,
        done: parsed.experience.length > 0,
      },
      {
        label: 'Education',
        weight: CV_COMPLETENESS_RULES.find((r) => r.key === 'education')!.weight,
        done: parsed.education.length > 0,
      },
    ];

    const completeness = checks.reduce((acc, item) => acc + (item.done ? item.weight : 0), 0);

    const missing = checks.filter((c) => !c.done).map((c) => c.label);

    return {
      completeness,
      missing,
    };
  }, [cv]);
}
