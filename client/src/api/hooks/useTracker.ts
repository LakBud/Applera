import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApplicationsByCv, updateApplicationStatus } from "../tracker.api";
import { queryKeys } from "../querykeys";

export function useTracker(cvId: string) {
  return useQuery({
    queryKey: queryKeys.tracker(cvId),
    queryFn: () => getApplicationsByCv(cvId),
    enabled: !!cvId,
    staleTime: 30_000,
  });
}

// PATCH application status
type UpdateStatusVars = {
  id: string;
  cvId: string;
  status: string;
  notes?: string;
};

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: UpdateStatusVars) => updateApplicationStatus(id, status, notes),

    // optimistic
    onMutate: async ({ id, cvId, status }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tracker(cvId),
      });

      const previous = queryClient.getQueryData<{ applications: any[] }>(queryKeys.tracker(cvId));

      queryClient.setQueryData(queryKeys.tracker(cvId), (old: { applications: any[] } | undefined) => {
        if (!old) return old;

        return {
          ...old,
          applications: old.applications.map((app) => (app._id === id ? { ...app, status } : app)),
        };
      });

      return { previous, cvId };
    },

    // rollback
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tracker(context.cvId), context.previous);
      }
    },

    // sync
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tracker(vars.cvId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.application(vars.id),
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}
