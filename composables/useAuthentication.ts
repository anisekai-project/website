import type {AuthResponse, User} from '~/types/api';

export default () => {

  const token = useCookie('token', {
    maxAge:   60 * 60 * 24,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production'
  });

  const user                          = useState<User | null>('authenticated_user', () => null);
  const isAuthenticated: Ref<boolean> = computed(() => user.value != null);
  const api                           = useApi();
  const config                        = useRuntimeConfig();

  console.log(config.public);

  const authenticate: (force?: boolean) => Promise<boolean> = async (force: boolean = false) => {
    if (user.value != null) return true;
    const search = new URLSearchParams(window.location.search);

    if (!search.has('code') || force) {
      window.location.href = config.public.loginUrl;
      return false;
    }

    const key = btoa(JSON.stringify({type: 'oauth', key: search.get('code')}));
    console.log('authenticate()', 'Exchanging', key);

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
