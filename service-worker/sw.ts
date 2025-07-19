/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import {clientsClaim} from 'workbox-core'
import {cleanupOutdatedCaches, precacheAndRoute} from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.skipWaiting()
clientsClaim()

self.addEventListener("push", onPush);
self.addEventListener("notificationclick", onNotificationClick);

function onPush(event: PushEvent) {
  if (!event.data) return;
  const {data, ...options} = event.data.json();
  const {action, content}: { action: string, content: never } = data;

  switch (action) {
    case 'notify':
      event.waitUntil(notify(options));
      break;
    case 'post':
      event.waitUntil(postData(content));
      break;
    default:
      console.error(`Unrecognized action: ${action}`, event.data.json());
  }
}

async function postData(data: never) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(data);
  })
}

function notify({title, ...options}: { title: string }) {
  console.log('action::notify', title, options);
  return self.registration.showNotification(title, options);
}

function onNotificationClick(event: NotificationEvent) {
  const handleNotificationClick = new Promise((resolve) => {
    event.notification.close();
    const url = event.notification.data.url;
    if (!url) return;
    resolve(openUrl(url));
  });
  event.waitUntil(handleNotificationClick);
}

function getIdealClient(clients: Readonly<WindowClient[]>) {
  const focusedClient = clients.find((c) => c.focused);
  const visibleClient = clients.find((c) => c.visibilityState === "visible");
  return focusedClient || visibleClient || clients[0];
}

async function openUrl(url: string) {
  const clients = await self.clients.matchAll({type: "window"});
  // Chrome 42-48 does not support navigate
  if (clients.length !== 0 && "navigate" in clients[0]!) {
    const client = getIdealClient(clients);
    await client?.navigate(url).then((client) => client?.focus());
  }
  await self.clients.openWindow(url);
}

