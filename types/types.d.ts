export type ColorScheme = 'primary' | 'highlight' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan';
export type SearchProvider<T> = (input: string) => Promise<T[]>;


export type RequestResponse<T> =
  | { isSuccessful: true; data: T }
  | { isSuccessful: false; error: SpringError };

export type ApiFetcher = <T extends ApiResponse>(endpoint: string, data?: any) => Promise<RequestResponse<T>>
