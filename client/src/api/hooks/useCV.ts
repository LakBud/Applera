import { useMutation } from "@tanstack/react-query";
import { uploadCVFile, uploadCVText, type UploadCVResponse } from "../cv.api";

/**
 * Upload a CV as a PDF file.
 * const { mutate, isPending, data, error } = useUploadCVFile();
 * mutate(file);
 */
export function useUploadCVFile() {
  return useMutation<UploadCVResponse, Error, File>({
    mutationFn: uploadCVFile,
  });
}

/**
 * Upload a CV as plain text.
 * const { mutate, isPending, data, error } = useUploadCVText();
 * mutate("John Doe, Software Engineer...");
 */
export function useUploadCVText() {
  return useMutation<UploadCVResponse, Error, string>({
    mutationFn: uploadCVText,
  });
}
