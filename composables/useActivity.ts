export default <T extends HTMLElement>(element: Ref<T | null>, timeout: number) => {

  const active        = ref(true);
  const inactiveSince = ref(0);
  const lock          = ref(true);

  let interval: number | null = null;

  const onActivity = () => {
    inactiveSince.value = 0;
    active.value        = true;
  };

  onMounted(async () => {
    await nextTick(() => {
      element.value?.addEventListener('mousemove', onActivity);
      element.value?.addEventListener('touchmove', onActivity);

      element.value?.addEventListener('mousedown', onActivity);
      element.value?.addEventListener('touchstart', onActivity);
      element.value?.addEventListener('touchend', onActivity);

      element.value?.addEventListener('keydown', onActivity);
    });

    interval = window.setInterval(() => {
      if (lock.value) {
        onActivity();
        return;
      }

      inactiveSince.value++;
      active.value = inactiveSince.value <= timeout * 10;
    }, 100);


  });

  onUnmounted(() => {
    if (interval) clearInterval(interval);

    element.value?.removeEventListener('mousemove', onActivity);
    element.value?.removeEventListener('mousedown', onActivity);
    element.value?.removeEventListener('keydown', onActivity);
  });

  watch(element, (el, oldEl) => {
    if (oldEl) {
      oldEl.removeEventListener('mousemove', onActivity);
      oldEl.removeEventListener('mousedown', onActivity);
      oldEl.removeEventListener('keydown', onActivity);
    }
    if (el) {
      el.addEventListener('mousemove', onActivity);
      el.addEventListener('mousedown', onActivity);
      el.addEventListener('keydown', onActivity);
    }
  });

  return {active, lock, onActivity};
}
