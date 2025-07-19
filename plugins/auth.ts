import type {User} from '~/types/api';

export default defineNuxtPlugin(async () => {

  const token = useCookie('token', {
    maxAge:   60 * 60 * 24,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production'
  });

  const user   = useState<User | null>('authenticated_user', () => null);
  const api    = useApi();
  const router = useRouter();

  const logout = async () => {
    if (user.value == null || router.currentRoute.value.path === '/login') return;
    user.value  = null;
    token.value = null;
    await router.push('/login');
  };

  const checkAuth = async () => {
    if (router.currentRoute.value.path === '/login') return;

    const response = await api.get<User>('/api/v3/auth');
    if (response.isSuccessful) {
      user.value = response.data;
    } else {
      await logout();
    }
  };

  if (!user.value) {
    await checkAuth();
  }

  return {
    provide: {logout}
  };
});
