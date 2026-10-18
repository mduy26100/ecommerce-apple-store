/**
 * Generic structures for standardized API responses from the backend.
 * Aligned with .NET Kernel.Application.Wrappers namespace.
 */

export interface CursorPagedResult {
  nextCursor?: string;
  previousCursor?: string;
  pageSize?: number;
  hasMore?: boolean;
  [key: string]: any;
}

export interface MetaInfo {
  timestamp?: string; // DateTime ISO format
  path?: string;
  method?: string;
  statusCode?: number;
  traceId?: string;
  requestId?: string;
  clientIp?: string;
  cursorPagedResult?: CursorPagedResult;
  [key: string]: any;
}

export interface ErrorInfo {
  type?: string;     // Matches .NET ApiError.Type (e.g., validation, business exception)
  message?: string;  // Matches .NET ApiError.Message
  details?: any;     // Matches .NET ApiError.Details
}

export interface ApiResponse<T> {
  data: T;
  meta?: MetaInfo;
  error?: ErrorInfo;
}
