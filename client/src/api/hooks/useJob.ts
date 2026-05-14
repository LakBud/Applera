import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { client } from "../client";
import { AnalyzeJobResponseSchema, JobDocumentSchema } from "../schemas";
import { z } from "zod";

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.job?.list?.() ?? ["job"],
    queryFn: async () => {
      const res = await client.get("/api/job");
      return z.array(JobDocumentSchema).parse(res.data);
    },
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: queryKeys.job?.detail?.(jobId) ?? ["job", jobId],
    queryFn: async () => {
      const res = await client.get(`/api/job/${jobId}`);
      return JobDocumentSchema.parse(res.data);
    },
    enabled: !!jobId,
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await client.delete(`/api/job/${jobId}`);
      return res.data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job"] });
    },
  });
}

export function useAnalyzeJobFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("job", file);

      const res = await client.post("/api/job", form);

      return AnalyzeJobResponseSchema.parse(res.data);
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.job.all });
    },
  });
}

export function useAnalyzeJobText() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (jobText: string) => {
      const res = await client.post("/api/job", {
        jobText,
      });

      return AnalyzeJobResponseSchema.parse(res.data);
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.job.all });
    },
  });
}
