export function getCVPdfUrl(cvId: string) {
  return `${import.meta.env.VITE_API_URL ?? "http://localhost:5005"}/api/cv/${cvId}/pdf`;
}

export function getCVPreviewUrl(cvId: string) {
  return `${import.meta.env.VITE_API_URL ?? "http://localhost:5005"}/api/cv/${cvId}/preview`;
}
