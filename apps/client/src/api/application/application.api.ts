import { z } from 'zod';

import { client } from '../client';
import {
  type Application,
  ApplicationSchema,
  type CreateApplicationRequest,
  CreateApplicationRequestSchema,
  CreateApplicationResponseSchema,
  GetApplicationResponseSchema,
  GetApplicationsResponseSchema,
  type UpdateApplicationStatusRequest,
  UpdateApplicationStatusSchema,
} from './application.schemas';

/**
 * Parses CV + job text, computes match, and generates a tailored application.
 * Expect ~10–30s response time — three LLM calls run sequentially.
 */
// POST api/application
export async function createApplication(data: CreateApplicationRequest): Promise<Application> {
  const body = CreateApplicationRequestSchema.parse(data);

  const response = await client.post('/api/application', body);

  return CreateApplicationResponseSchema.parse(response.data).application;
}

// GET api/application/:id
export async function getApplicationById(id: string): Promise<Application> {
  const response = await client.get(`/api/application/${id}`);

  return GetApplicationResponseSchema.parse(response.data).application;
}

// GET api/application
export async function getApplications(): Promise<Application[]> {
  const response = await client.get('/api/application');
  return GetApplicationsResponseSchema.parse(response.data).applications;
}

// PATCH /application/:id/status
export async function ApplicationStatus(
  id: string,
  data: UpdateApplicationStatusRequest,
): Promise<Application> {
  const body = UpdateApplicationStatusSchema.parse(data);

  const response = await client.patch(`/api/application/${id}`, body);

  return GetApplicationResponseSchema.parse(response.data).application;
}

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
