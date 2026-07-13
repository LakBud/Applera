import {
  ApplicationListResponseSchema,
  ApplicationResponseSchema,
  CreateApplicationRequestSchema,
  UpdateApplicationStatusRequestSchema,
  type Application,
  type CreateApplicationRequest,
  type UpdateApplicationStatusRequest,
} from '@applera/schemas';

import { client } from '../client';

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

  return ApplicationListResponseSchema.parse(response.data).applications;
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
