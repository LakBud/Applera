import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { client } from "../client";
import { ApplicationSchema, CreateApplicationResponseSchema } from "../schemas";
import { z } from "zod";
import { toast } from "sonner";

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

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.application.all,
    queryFn: async () => {
      const res = await client.get("/api/application");
      return z.array(ApplicationSchema).parse(res.data.applications);
    },
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { cvId: string; jobId: string }) => {
      const res = await client.post("/api/application", data);
      return CreateApplicationResponseSchema.parse(res.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.application.all });
      toast.success("Application created");
    },
    onError: () => {
      toast.error("Failed to create application. Please try again.");
    },
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/api/application/${id}`);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.application.all });
      qc.removeQueries({ queryKey: queryKeys.application.detail(id) });
      toast.success("Application deleted");
    },
    onError: () => {
      toast.error("Failed to delete application. Please try again.");
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
      qc.invalidateQueries({ queryKey: queryKeys.application.detail(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.application.all });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status. Please try again.");
    },
  });
}
