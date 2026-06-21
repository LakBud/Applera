import { client } from '../client';
import {
  ApplicationResponseSchema,
  ApplicationsResponseSchema,
  type CreateApplicationRequest,
  CreateApplicationRequestSchema,
  type UpdateApplicationStatusRequest,
  UpdateApplicationStatusRequestSchema,
} from './application.schemas';

import type { Application } from '@repo/schemas';

/**
 * Create application
 */
export async function createApplication(data: CreateApplicationRequest): Promise<Application> {
  const body = CreateApplicationRequestSchema.parse(data);

  const response = await client.post('/api/application', body);

  return ApplicationResponseSchema.parse(response.data).application;
}

/**
 * Get application by id
 */
export async function getApplicationById(id: string): Promise<Application> {
  const response = await client.get(`/api/application/${id}`);

  return ApplicationResponseSchema.parse(response.data).application;
}

/**
 * Get all applications
 */
export async function getApplications(): Promise<Application[]> {
  const response = await client.get('/api/application');

  return ApplicationsResponseSchema.parse(response.data).applications;
}

/**
 * Update status
 */
export async function updateApplicationStatus(
  id: string,
  data: UpdateApplicationStatusRequest,
): Promise<Application> {
  const body = UpdateApplicationStatusRequestSchema.parse(data);

  const response = await client.patch(`/api/application/${id}/status`, body);

  return ApplicationResponseSchema.parse(response.data).application;
}

/**
 * Delete application
 */
export async function deleteApplication(id: string): Promise<void> {
  await client.delete(`/api/application/${id}`);
}

/**
 * Tracker: get by CV
 */
export async function getApplicationsByCv(cvId: string): Promise<Application[]> {
  const res = await client.get(`/api/tracker/${cvId}`);
  return ApplicationsResponseSchema.parse(res.data).applications;
}

/**
 * Tracker: get single
 */
export async function getApplication(id: string): Promise<Application> {
  const res = await client.get(`/api/tracker/application/${id}`);

  return ApplicationResponseSchema.parse(res.data).application;
}
