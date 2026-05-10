import { useMutation } from "@tanstack/react-query";
import { createApplication } from "../application.api";
import type { CreateApplicationRequest, CreateApplicationResponse } from "../types";

/**
 * Mutation hook for the full application generation pipeline.
 *
 * Usage:
 *   const { mutate, isPending, data, error } = useCreateApplication();
 *   mutate({ cvText, jobText });
 */
export function useCreateApplication() {
  return useMutation<CreateApplicationResponse, Error, CreateApplicationRequest>({
    mutationFn: createApplication,
  });
}
