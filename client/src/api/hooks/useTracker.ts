import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApplicationsByCv, updateApplicationStatus } from "../tracker.api";
import { queryKeys } from "../queryKeys";

export function useTracker(cvId: string) {
  return useQuery({
    queryKey: queryKeys.application.byCv(cvId),
    queryFn: () => getApplicationsByCv(cvId),
    enabled: !!cvId,
  });
}

// PATCH application status
export type UpdateStatusVars = {
  id: string;
  cvId: string;
  status: "generated" | "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";
  notes?: string;
};

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: UpdateStatusVars) => updateApplicationStatus(id, status, notes),

    onMutate: async ({ id, cvId, status }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.application.byCv(cvId),
      });

      const previous = queryClient.getQueryData(queryKeys.application.byCv(cvId));

      queryClient.setQueryData(queryKeys.application.byCv(cvId), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          applications: old.applications.map((app: any) => (app._id === id ? { ...app, status } : app)),
        };
      });

      return { previous, cvId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.application.byCv(ctx.cvId), ctx.previous);
      }
    },

    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.application.byCv(vars.cvId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.application.detail(vars.id),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard(vars.cvId),
      });
    },
  });
}
