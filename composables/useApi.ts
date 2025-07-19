import type {RequestResponse}          from '~/types/types';
import type {ApiResponse, SpringError} from '~/types/api';

export default () => {

  const config = useRuntimeConfig();

  const token = useCookie('token', {
    maxAge:   60 * 60 * 24,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production'
  });

  const {$logout}: { $logout: () => Promise<void> } = useNuxtApp();

  const get = async <T extends ApiResponse>(endpoint: string): Promise<RequestResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : config.public.apiUrl + endpoint;

    try {
      const response = await $fetch<T>(url, {
        method:  'GET',
        headers: {
          Accept: 'application/json',
          ...(token.value ? {Authorization: `Bearer ${token.value}`} : {})
        }
      });
      return {isSuccessful: true, data: response};
    } catch (error: any) {
      if (error?.data.status === 401) {
        if ($logout) await $logout();
      }

      return {isSuccessful: false, error: error?.data as SpringError};
    }
  };

  const post = async <T extends ApiResponse>(endpoint: string, data: any): Promise<RequestResponse<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : config.public.apiUrl + endpoint;

    try {
      const response = await $fetch<T>(url, {
        method:  'POST',
        headers: {
          'Accept':       'application/json',
          'Content-Type': 'application/json',
          ...(token.value ? {Authorization: `Bearer ${token.value}`} : {})
        },
        body:    data
      });
      return {isSuccessful: true, data: response};
    } catch (error: any) {
      if (error?.data.status === 401) {
        if ($logout) await $logout();
      }

      return {isSuccessful: false, error: error?.data as SpringError};
    }
  };

  const fetch = async <T>(endpoint: string): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : config.public.apiUrl + endpoint;

    return await $fetch<T>(url, {
      method:  'GET',
      headers: {
        'Accept': 'application/json',
        ...(token.value ? {Authorization: `Bearer ${token.value}`} : {})
      }
    });
  };

  const downloadFile = async (endpoint: string): Promise<Blob> => {
    const url = endpoint.startsWith('http') ? endpoint : config.public.apiUrl + endpoint;

    const response = await window.fetch(url, {
      method:  'GET',
      headers: {
        'Accept': 'application/octet-stream',
        ...(token.value ? {Authorization: `Bearer ${token.value}`} : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    return await response.blob();
  };

  return {get, post, fetch, downloadFile};
}
