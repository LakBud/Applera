import { z } from 'zod';

import { client } from './client';
import { ApplicationSchema } from './schemas';

// GET /api/tracker/:cvId
export async function getApplicationsByCv(cvId: string) {
  const res = await client.get(`/api/tracker/${cvId}`);

  return z
    .object({
      applications: z.array(ApplicationSchema),
    })
    .parse(res.data);
}

// GET /tracker/application/:id
export async function getApplication(id: string) {
  const res = await client.get(`/api/tracker/application/${id}`);

  return z
    .object({
      application: ApplicationSchema,
    })
    .parse(res.data);
}

// PATCH /tracker/application/:id/status
export async function updateApplicationStatus(id: string, status: string, notes?: string) {
  const res = await client.patch(`/api/tracker/application/${id}/status`, {
    status,
    notes,
  });

  return z
    .object({
      application: ApplicationSchema,
    })
    .parse(res.data);
}
