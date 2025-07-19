import type {RequestResponse}          from '~/types/types';
import type {ApiResponse, SpringError} from '~/types/api';

export default () => {

  const config = useRuntimeConfig();
  console.log(config.public);

  const token = useCookie('token', {
    maxAge:   60 * 60 * 24,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production'
  });

  const {$logout}: {$logout: () => Promise<void>} = useNuxtApp();

  const get = async <T extends ApiResponse>(endpoint: string): Promise<RequestResponse<T>> => {
    const url = config.public.apiUrl + endpoint;
    console.log('get()', 'Using', token.value)

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
        if($logout) await $logout();
      }

      return {isSuccessful: false, error: error?.data as SpringError};
    }
  };

  const post = async <T extends ApiResponse>(endpoint: string, data: any): Promise<RequestResponse<T>> => {
    const url = config.public.apiUrl + endpoint;

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
        if($logout) await $logout();
      }

      return {isSuccessful: false, error: error?.data as SpringError};
    }
  };

  const fetch = async <T>(endpoint: string): Promise<T> => {
    const url = config.public.apiUrl + endpoint;

    return await $fetch<T>(url, {
      method:  'GET',
      headers: {
        'Accept': 'application/json',
        ...(token.value ? {Authorization: `Bearer ${token.value}`} : {})
      }
    });
  };

  return {get, post, fetch};
}
