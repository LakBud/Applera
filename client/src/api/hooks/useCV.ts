import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadCVFile, uploadCVText, getCVs, type UploadCVResponse } from "../cv.api";
import { queryKeys } from "../queryKeys";

/**
 * Upload a CV as a PDF file.
 */
export function useUploadCVFile() {
  return useMutation<UploadCVResponse, Error, File>({
    mutationFn: uploadCVFile,
  });
}

/**
 * Upload a CV as plain text.
 */
export function useUploadCVText() {
  return useMutation<UploadCVResponse, Error, string>({
    mutationFn: uploadCVText,
  });
}

/**
 * Fetch all CVs for the logged-in user
 */
export function useCVs() {
  return useQuery({
    queryKey: queryKeys.cv.all,
    queryFn: getCVs,
  });
}
