
declare module '#app' {
  import type {RequestResponse} from "~/types/types";

  interface NuxtApp {
    $fetchApi: <T extends ApiResponse>(endpoint: string, data?: any) => Promise<RequestResponse<T>>
  }
}
