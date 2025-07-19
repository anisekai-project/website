export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState('authenticated_user', () => null);

  if (!user.value) {
    return navigateTo('/login'); // Or wherever your login page is
  }
});
