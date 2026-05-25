import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { queryKeys } from "../queryKeys";
import { client } from "../client";
import { CVDocumentSchema, DashboardSchema, UploadCVResponseSchema } from "../schemas";

export function useCVs() {
  return useQuery({
    queryKey: queryKeys.cv.list(),
    queryFn: async () => {
      const res = await client.get("/api/cv");
      return z.array(CVDocumentSchema).parse(res.data);
    },
  });
}

export function useCV(cvId: string) {
  return useQuery({
    queryKey: queryKeys.cv.detail(cvId),
    queryFn: async () => {
      const res = await client.get(`/api/cv/${cvId}`);
      return CVDocumentSchema.parse(res.data);
    },
    enabled: !!cvId,
  });
}

export function useDeleteCV() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (cvId: string) => {
      const res = await client.delete(`/api/cv/${cvId}`);
      return res.data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv.all });
    },
  });
}

export function useUploadCVFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("cv", file);

      const res = await client.post("/api/cv", form);

      return UploadCVResponseSchema.parse(res.data);
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv.all });
    },
  });
}

export function useUploadCVText() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (cvText: string) => {
      const res = await client.post("/api/cv", {
        cvText,
      });

      return UploadCVResponseSchema.parse(res.data);
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv.all });
    },
  });
}

export function useCVDashboard(cvId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.byCv(cvId),
    queryFn: async () => {
      const res = await client.get(`/api/dashboard/${cvId}`);
      return DashboardSchema.parse(res.data);
    },
    enabled: !!cvId,
  });
}
