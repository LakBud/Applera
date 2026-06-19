import { CVParsedSchema } from '@repo/schemas';
import { z } from 'zod';

import { JobDocumentSchema } from '../job/job.schemas';
import { ConfidenceSchema } from '../schemas';

/**
 * NOTE:
 * We intentionally DO NOT import CVDocumentSchema here
 * to avoid circular dependency issues.
 *
 * Instead we use refrence its shape.
 */

export const ApplicationStatusSchema = z.enum([
  'generated',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
]);

export const MatchSchema = z.object({
  score: z.number(),
  confidence: ConfidenceSchema,
  strengths: z.array(z.string()),
  missing_skills: z.array(z.string()),
});

/**
 * CV reference (prevents circular imports)
 */
// export const CVRefParsedSchema = z.object({
//   name: z.string().optional(),
//   email: z.string().optional(),
//   phone: z.string().optional(),
//   github: z.string().optional(),
//   summary: z.string().optional(),
//   seniority_level: z.string().optional(),
//   location: z.string().optional(),

//   skills: z.array(z.string()),

//   experience: z.array(
//     z.object({
//       title: z.string().optional(),
//       company: z.string().optional(),
//       highlights: z.array(z.string()),
//     }),
//   ),

//   education: z.array(
//     z.object({
//       title: z.string().optional(),
//       school: z.string().optional(),
//     }),
//   ),

//   projects: z
//     .array(
//       z.object({
//         name: z.string().optional(),
//         description: z.string().optional(),
//         url: z.string().optional(),
//         tech: z.array(z.string()).default([]),
//       }),
//     )
//     .default([]),
// });

// export const CVRefSchema = z.object({
//   _id: z.string(),
//   rawText: z.string().optional(),
//   parsed: CVRefParsedSchema,

//   applicationsCount: z.number().optional(),
//   lastUsedAt: z.string().optional(),
//   pinned: z.boolean().default(false),

//   pdfUrl: z.string().optional(),
//   previewUrl: z.string().optional(),
//   cloudinaryPublicId: z.string().optional(),

//   createdAt: z.string().optional(),
//   updatedAt: z.string().optional(),
// });

// Application

export const ApplicationSchema = z.object({
  _id: z.string(),

  cv: CVParsedSchema.nullable(),
  job: JobDocumentSchema.nullable(),

  match: MatchSchema,

  tailored_cv_summary: z.string(),
  cover_letter: z.string(),

  // Snapshots
  jobTitleSnapshot: z.string().optional(),
  companySnapshot: z.string().optional(),
  locationSnapshot: z.string().optional(),
  cvNameSnapshot: z.string().optional(),

  application_email: z.object({
    subject: z.string(),
    body: z.string(),
  }),

  status: ApplicationStatusSchema,
  notes: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateApplicationRequestSchema = z.object({
  cvId: z.string(),
  jobId: z.string(),
});

export const CreateApplicationResponseSchema = z.object({
  application: ApplicationSchema,
});

export const GetApplicationsResponseSchema = z.object({
  applications: z.array(ApplicationSchema),
});

export const GetApplicationResponseSchema = z.object({
  application: ApplicationSchema,
});

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatusSchema,
  notes: z.string().optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;
export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;
export type UpdateApplicationStatusRequest = z.infer<typeof UpdateApplicationStatusSchema>;
export type CreateApplicationResponse = z.infer<typeof CreateApplicationResponseSchema>;
