import { z } from 'zod';

import { client } from '../client';
import {
  type CreateJobResponse,
  CreateJobResponseSchema,
  type JobDocument,
  JobDocumentSchema,
} from './job.schemas';

// GET /api/job
export async function getJobs(): Promise<JobDocument[]> {
  const response = await client.get('/api/job');

  return z.array(JobDocumentSchema).parse(response.data);
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
export async function deleteJob(id: string): Promise<{ message: string }> {
  const response = await client.delete(`/api/job/${id}`);

  return z.object({ message: z.string() }).parse(response.data);
}
