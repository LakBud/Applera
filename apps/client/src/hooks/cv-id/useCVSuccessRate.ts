import { useMemo } from 'react';

import { ApplicationStatusSchema, type DashboardCV } from '@applera/schemas';
import { z } from 'zod';

export const SuccessStatusSchema = ApplicationStatusSchema.extract([
  'applied',
  'interviewing',
  'offered',
]);

export type SuccessStatus = z.infer<typeof SuccessStatusSchema>;

export function useCVSuccessRate(dashboard?: DashboardCV) {
  return useMemo(() => {
    if (!dashboard) {
      return { successRate: 0, successCount: 0 };
    }

    // derive safe array from schema (single source of truth)
    const successStatuses = SuccessStatusSchema.options;

    const successSet = new Set<SuccessStatus>(successStatuses);

    const successCount = dashboard.applications.filter((app) =>
      successSet.has(app.status as SuccessStatus),
    ).length;

    const successRate =
      dashboard.total > 0 ? Math.round((successCount / dashboard.total) * 100) : 0;

    return { successRate, successCount };
  }, [dashboard]);
}
