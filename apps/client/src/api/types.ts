export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  limit?: number;
  count?: number;
  remaining?: number;
}
export type ClientErrorCode =
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'USAGE_LIMIT_REACHED'
  | 'UNKNOWN';

export interface ClientError extends Error {
  code: ClientErrorCode;
  message: string;
  meta?: {
    limit?: number;
    count?: number;
    remaining?: number;
  };
}
