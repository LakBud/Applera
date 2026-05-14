export const queryKeys = {
  cv: {
    all: ["cv"] as const,
    detail: (cvId: string) => ["cv", cvId] as const,
  },

  application: {
    all: ["application"] as const,
    detail: (id: string) => ["application", id] as const,
    byCv: (cvId: string) => ["application", "cv", cvId] as const,
  },

  dashboard: (cvId: string) => ["dashboard", cvId] as const,

  interviewPrep: (applicationId: string) => ["interview-prep", applicationId] as const,
};
