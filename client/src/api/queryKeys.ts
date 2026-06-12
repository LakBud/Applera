export const queryKeys = {
  cv: {
    all: ['cv'] as const,
    list: () => [...queryKeys.cv.all, 'list'] as const,
    detail: (cvId: string) => [...queryKeys.cv.all, cvId] as const,
  },

  job: {
    all: ['job'] as const,
    list: () => [...queryKeys.job.all, 'list'] as const,
    detail: (jobId: string) => [...queryKeys.job.all, jobId] as const,
  },

  application: {
    all: ['application'] as const,
    list: () => [...queryKeys.application.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.application.all, id] as const,
    byCv: (cvId: string) => [...queryKeys.application.all, 'cv', cvId] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    byCv: (cvId: string) => [...queryKeys.dashboard.all, cvId] as const,
  },

  interviewPrep: {
    all: ['interview-prep'] as const,
    byApplication: (applicationId: string) =>
      [...queryKeys.interviewPrep.all, applicationId] as const,
  },
};
