import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { client } from "../client";
import { ApplicationSchema } from "../schemas";
import { z } from "zod";

export function useApplicationsByCv(cvId: string) {
  return useQuery({
    queryKey: queryKeys.application.byCv(cvId),
    queryFn: async () => {
      const res = await client.get(`/api/tracker/${cvId}`);
      return z.array(ApplicationSchema).parse(res.data.applications);
    },
    enabled: !!cvId,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: queryKeys.application.detail(id),
    queryFn: async () => {
      const res = await client.get(`/api/tracker/application/${id}`);
      return ApplicationSchema.parse(res.data.application);
    },
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { cvText: string; jobText: string }) => {
      const res = await client.post("/api/application", data);
      return ApplicationSchema.parse(res.data.application);
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.application.all });
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await client.patch(`/api/tracker/application/${id}/status`, { status, notes });

      return ApplicationSchema.parse(res.data.application);
    },

    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: queryKeys.application.detail(vars.id),
      });

      qc.invalidateQueries({
        queryKey: queryKeys.application.all,
      });
    },
  });
}
