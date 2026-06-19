import {
  type CVDocument,
  CVDocumentSchema,
  type DashboardCV,
  DashboardCVSchema,
  type UploadCVResponse,
  UploadCVResponseSchema,
} from '@repo/schemas';
import { z } from 'zod';

import { client } from '../client';

// GET /api/cv
export async function getCVs(): Promise<CVDocument[]> {
  const response = await client.get('/api/cv');
  return z.array(CVDocumentSchema).parse(response.data);
}

// GET /api/cv/:id
export async function getCVById(id: string): Promise<CVDocument> {
  const response = await client.get(`/api/cv/${id}`);
  return CVDocumentSchema.parse(response.data);
}

// POST /api/cv (multipart/form-data)
export async function uploadCVFile(file: File): Promise<UploadCVResponse> {
  const formData = new FormData();
  formData.append('cv', file);

  const response = await client.post('/api/cv', formData);

  return UploadCVResponseSchema.parse(response.data);
}

// POST /api/cv (json)
export async function uploadCVText(cvText: string): Promise<UploadCVResponse> {
  const response = await client.post('/api/cv', {
    cvText,
  });

  return UploadCVResponseSchema.parse(response.data);
}

// DELETE /api/cv/id
export async function deleteCVById(id: string): Promise<{ message: string }> {
  const response = await client.delete(`/api/cv/${id}`);
  return response.data;
}

// PATCH /api/cv/id/pin
export async function pinCV(id: string): Promise<{ message: string }> {
  const response = await client.patch(`/api/cv/${id}/pin`);
  return response.data;
}

// GET dashboard for CV
export async function getCVDashboard(cvId: string): Promise<DashboardCV> {
  const res = await client.get<unknown>(`/api/dashboard/${cvId}`);

  return DashboardCVSchema.parse(res.data);
}
