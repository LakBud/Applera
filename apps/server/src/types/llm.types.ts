import type { ReserveUsage, RefundUsage } from 'vern-llm';

export type UsageResult = {
  count: number;
  limit: number;
  remaining: number;
};

export type { ReserveUsage, RefundUsage };

export type LLMExecutionOptions = {
  signal?: AbortSignal;
  reserveUsage?: ReserveUsage;
  refundUsage?: RefundUsage;
};
