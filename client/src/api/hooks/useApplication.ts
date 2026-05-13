import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApplication } from "../application.api";
import type { CreateApplicationRequest, CreateApplicationResponse } from "../types";
import { queryKeys } from "../queryKeys";

/**
 * Mutation hook for the full application generation pipeline.
 *
 * Usage:
 *   const { mutate, isPending, data, error } = useCreateApplication();
 *   mutate({ cvText, jobText });
 */

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation<CreateApplicationResponse, Error, CreateApplicationRequest>({
    mutationFn: createApplication,

    onSuccess: async (data) => {
      // extract IDs from response
      const cvId = data.cv._id;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tracker(cvId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(cvId) }),
      ]);
    },
  });
}
