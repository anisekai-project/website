import {DateTime}                                                 from 'luxon';
import type {RequestResponse}                                     from '~/types/types';
import type {ApiResponse, AuthResponse, SpringError, Token, User} from '~/types/api';


export function useAnisekai() {

  const router                 = useRouter();
  const config                 = useRuntimeConfig();
  const user: Ref<User | null> = useState('user', () => null);

  const accessToken = useCookie('anisekai-access-token', {
    maxAge:   60 * 60 * 8,
    sameSite: 'strict',
    secure:   false
  });

  const refreshToken = useCookie('anisekai-refresh-token', {
    maxAge:   60 * 60 * 24 * 7,
    sameSite: 'strict',
    secure:   false
  });

  const token: Ref<Token | null> = computed(() => {
    if (accessToken.value == null) return null;
    return JSON.parse(window.atob(accessToken.value.split('.')[1])) as Token;
  });

  const expiresSoon = computed(() => {
    if (token.value == null) return false;
    return (token.value.exp - DateTime.now().toSeconds()) < 60;
  });

  async function clear() {
    console.log('[clear()] Clearing cookies...');
    accessToken.value  = null;
    refreshToken.value = null;
    console.log('[clear()] Redirecting to (/login)...');
    await router.push('/login');
  }

  async function get<T extends ApiResponse>(endpoint: string): Promise<RequestResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : config.public.apiUrl + endpoint;
    console.log(`[get()] Sending request to (${url})`);

    try {
      const response = await $fetch<T>(url, {
        method:  'GET',
        headers: {
          Accept: 'application/json',
          ...(accessToken.value ? {Authorization: `Bearer ${accessToken.value}`} : {})
        }
      });
      return {isSuccessful: true, data: response};
    } catch (error: any) {
      if (error?.data.status === 401) {
        await clear();
      }
      return {isSuccessful: false, error: error?.data as SpringError};
    }
  }

  async function post<T extends ApiResponse>(endpoint: string, body: any): Promise<RequestResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : config.public.apiUrl + endpoint;
    console.log(`[post()] Sending request to (${url})`);

    try {
      const response = await $fetch<T>(url, {
        method:  'POST',
        headers: {
          'Accept':       'application/json',
          'Content-Type': 'application/json',
          ...(accessToken.value ? {Authorization: `Bearer ${accessToken.value}`} : {})
        },
        body
      });
      return {isSuccessful: true, data: response};
    } catch (error: any) {
      if (error?.data.status === 401) {
        await clear();
      }
      return {isSuccessful: false, error: error?.data as SpringError};
    }
  }

  async function file(endpoint: string, asText: boolean = false): Promise<Blob | string> {
    const url = endpoint.startsWith('http') ? endpoint : config.public.apiUrl + endpoint;
    console.log(`[file()] Sending request to (${url})`);

    const response = await window.fetch(url, {
      method:  'GET',
      headers: {
        'Accept': 'application/octet-stream',
        ...(accessToken.value ? {Authorization: `Bearer ${accessToken.value}`} : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    return asText ? await response.text() : await response.blob();
  }

  async function authenticate(force?: boolean): Promise<boolean> {
    if (user.value) {
      console.log(`[authenticate()] User is already logged in.`);
      return true;
    }

    if (accessToken.value) {
      console.log(`[authenticate()] Cookies present, loading user data...`);
      await getUserData();
      return true;
    }

    const search = new URLSearchParams(window.location.search);

    if (!search.has('code') || force) {
      window.location.href = config.public.loginUrl;
      return false;
    }

    const key = search.get('code');

    console.log(`[authenticate()] Exchanging code (${key}) against a JWT token...`);

    const response = await post<AuthResponse>('/api/v3/auth/code', {key});

    if (response.isSuccessful) {
      console.log(`[authenticate()] Obtained tokens !`);
      accessToken.value  = response.data.accessToken;
      refreshToken.value = response.data.refreshToken;
      console.log(`[authenticate()] Loading user data...`);
      await getUserData();
      console.log(`[authenticate()] Welcome!`);
      return true;
    }
    throw response.error;
  }

  async function getUserData(): Promise<void> {
    const response = await get<User>('/api/v3/auth/me');
    if (response.isSuccessful) {
      user.value = response.data;
      console.log(`[getUserData()] Welcome, ${response.data.username}!`);
    } else {
      throw response.error;
    }
  }

  async function doTokenRefresh(): Promise<boolean> {
    if (refreshToken.value == null) {
      console.log(`[doTokenRefresh()] No refresh token to get new token.`);
      return false;
    }
    const response = await post<AuthResponse>('/api/v3/auth/refresh', {key: refreshToken.value});

    if (response.isSuccessful) {
      accessToken.value  = response.data.accessToken;
      refreshToken.value = response.data.refreshToken;
      console.log(`[doTokenRefresh()] Token refreshed, updating user data...`);
      await getUserData();
      console.log(`[doTokenRefresh()] Done.`);
      return true;
    }
    return false;
  }

  async function checkToken(): Promise<boolean> {
    console.log(`[checkToken()] Checking token...`);
    if (refreshToken.value == null) {
      await clear();
      return false;
    }

    if (accessToken.value == null || expiresSoon.value) {
      console.log(`[checkToken()] Refreshing token...`);
      if (!await doTokenRefresh()) {
        console.log(`[checkToken()] Logging out...`);
        await logout();
        user.value = null;
        return false;
      }
    }

    if (user.value == null) {
      console.log(`[checkToken()] Retrieving user data...`);
      await getUserData();
    }
    return true;
  }

  return {
    accessToken,
    user,
    clear,
    api: { get, post, file },
    authenticate,
    checkToken
  }
}
