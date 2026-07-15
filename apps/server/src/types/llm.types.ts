export type UsageResult = {
  count: number;
  limit: number;
  remaining: number;
};

export type ReserveUsage = () => Promise<UsageResult>;

export type LLMExecutionOptions = {
  signal?: AbortSignal;
  reserveUsage?: ReserveUsage;
};
