import { useMutation } from "@tanstack/react-query";
import { analyzeJobFile, analyzeJobText } from "../job.api";
import type { AnalyzeJobResponse } from "../types";

/**
 * Analyze a job listing uploaded as a PDF.
 * const { mutate, isPending, data, error } = useAnalyzeJobFile();
 * mutate(file);
 */
export function useAnalyzeJobFile() {
  return useMutation<AnalyzeJobResponse, Error, File>({
    mutationFn: analyzeJobFile,
  });
}

/**
 * Analyze a job listing as plain text.
 * const { mutate, isPending, data, error } = useAnalyzeJobText();
 * mutate("We are looking for a Senior Backend Developer...");
 */
export function useAnalyzeJobText() {
  return useMutation<AnalyzeJobResponse, Error, string>({
    mutationFn: analyzeJobText,
  });
}
