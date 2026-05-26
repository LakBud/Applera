import { z } from "zod";

export const JobSchema = z.object({
  title: z.string(),
  required_skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  seniority: z.enum(["executive", "intern", "junior", "mid", "senior", "lead", "unknown"]),
});

export const CVSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  github: z.string(),
  summary: z.string(),
  seniority_level: z.string(),
  skills: z.array(z.string()).default([]),

  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        highlights: z.array(z.string()),
      }),
    )
    .default([]),

  education: z
    .array(
      z.object({
        title: z.string(),
        school: z.string(),
      }),
    )
    .default([]),

  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string(),
        tech: z.array(z.string()),
      }),
    )
    .default([]),

  pdfUrl: z.string().optional(),
  previewImageUrl: z.string().optional(),
});

export type CVSchemaData = z.infer<typeof CVSchema>;
export type JobSchemaData = z.infer<typeof JobSchema>;
