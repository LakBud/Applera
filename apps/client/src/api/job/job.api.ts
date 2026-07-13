import {
  type CreateJobResponse,
  CreateJobResponseSchema,
  type JobDocument,
  JobDocumentSchema,
  type JobListResponse,
  JobListResponseSchema,
  type MessageResponse,
  MessageResponseSchema,
} from '@applera/schemas';

import { client } from '../client';

// GET /api/job
export async function getJobs(): Promise<JobListResponse> {
  const response = await client.get('/api/job');

  return JobListResponseSchema.parse(response.data);
}

// GET /api/job/:id
export async function getJobById(id: string): Promise<JobDocument> {
  const response = await client.get(`/api/job/${id}`);

  return JobDocumentSchema.parse(response.data);
}

// POST /api/job
export async function createJobFile(file: File): Promise<CreateJobResponse> {
  const form = new FormData();
  form.append('job', file);

  const response = await client.post('/api/job', form);

  return CreateJobResponseSchema.parse(response.data);
}

// POST /api/job
export async function createJobText(jobText: string): Promise<CreateJobResponse> {
  const response = await client.post('/api/job', { jobText });

  return CreateJobResponseSchema.parse(response.data);
}

// DELETE /api/job/:id
export async function deleteJobById(id: string): Promise<MessageResponse> {
  const response = await client.delete(`/api/job/${id}`);

  return MessageResponseSchema.parse(response.data);
}
