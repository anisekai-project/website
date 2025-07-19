import type {AuthResponse, User} from '~/types/api';
import {value}                   from 'valibot';

export default () => {

  const token = useCookie('token', {
    maxAge:   60 * 60 * 24,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production'
  });

  const user                          = useState<User | null>('authenticated_user', () => null);
  const isAuthenticated: Ref<boolean> = computed(() => user.value != null);
  const api                           = useApi();

  const authenticate: (force?: boolean) => Promise<boolean> = async (force: boolean = false) => {
    if (user.value != null) return true;
    const search = new URLSearchParams(window.location.search);

    if (!search.has('code') || force) {
      window.location.href = 'https://discord.com/oauth2/authorize?client_id=1383966757059821641&response_type=code&redirect_uri=http%3A%2F%2F192.168.1.20%3A3000%2Flogin&scope=identify';
      return false;
    }

    const key = btoa(JSON.stringify({type: 'oauth', key: search.get('code')}));
    console.log('authenticate()', 'Exchanging', key)

    const response = await api.post<AuthResponse>('/api/v3/auth/code', {key});

    if (response.isSuccessful) {
      user.value  = response.data.user;
      token.value = response.data.token;
      console.log('authenticate()', 'Obtained token', token.value, JSON.parse(atob(token.value)));
      return true;
    }

    throw response.error;
  };

  return {user, isAuthenticated, authenticate};
}
