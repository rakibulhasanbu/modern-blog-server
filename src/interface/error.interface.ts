export interface TErrorSources {
  path: string | number;
  message: string;
}

export interface TErrorResponse {
  statusCode: number;
  message: string;
  errorMessage: string;
  errorDetails: unknown;
}
