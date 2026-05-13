export const queryKeys = {
  dashboard: (cvId: string) => ["dashboard", cvId] as const,
  tracker: (cvId: string) => ["tracker", cvId] as const,
  application: (id: string) => ["application", id] as const,
  prep: (applicationId: string) => ["prep", applicationId] as const,
};
