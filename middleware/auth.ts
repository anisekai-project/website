export default defineNuxtRouteMiddleware(async (to, from) => {

  console.log(`[middleware] Moving from route [${from.fullPath}] to route [${to.fullPath}]`);
  const {checkToken, user} = useAnisekai();
  await checkToken();

  if (to.fullPath === '/login' && user.value != null) {
    console.log(`[middleware] Attempt to navigate to (${to.fullPath}) while being logged in. Navigating to (/)...`);
    return navigateTo('/');
  } else if (to.fullPath !== '/login' && user.value == null) {
    console.log(`[middleware] Attempt to navigate to (${to.fullPath}) while being not logged in. Navigating to (/login)...`);
    return navigateTo('/login');
  }
});
