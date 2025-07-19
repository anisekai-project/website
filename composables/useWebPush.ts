export default () => {

  const configuration = useRuntimeConfig().public;

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64  = (base64String + padding)
      .replaceAll('-', '+')
      .replaceAll('_', '/');

    const rawData     = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  const retrieveOrCreateSubscription = async (registration: ServiceWorkerRegistration) => {
    const activeSubscription = await registration.pushManager.getSubscription();
    if (activeSubscription) {
      return activeSubscription;
    }


    return await registration.pushManager.subscribe({
                                                      userVisibleOnly:      true,
                                                      applicationServerKey: urlBase64ToUint8Array(configuration.vapidKey)
                                                    });
  };

  const subscribe = async (registration: ServiceWorkerRegistration, user: number) => {
    const subscription = await retrieveOrCreateSubscription(registration);

    await fetch(configuration.vapidUrl, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode:    'cors',
      body:    JSON.stringify(subscription)
    });

    return subscription;
  };

  const unsubscribe = async (registration: ServiceWorkerRegistration) => {
    const activeSubscription = await registration.pushManager.getSubscription();
    if (activeSubscription) {
      return activeSubscription.unsubscribe();
    }
    return false;
  };

  return {subscribe, unsubscribe};
}
