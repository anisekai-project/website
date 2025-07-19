export default <T extends HTMLElement>(element: Ref<T | null>): Ref<number> => {
  const ratio: Ref<number> = ref(0);

  const updateRatio = (clientX: number) => {
    const el = element.value;
    if (!el) return;

    const rect  = el.getBoundingClientRect();
    const x     = Math.max(0, Math.min(clientX - rect.left, rect.width));
    ratio.value = rect.width === 0 ? 0 : x / rect.width;
  };

  onMounted(() => {
    const onMouseMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      if (clientX != null) updateRatio(clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      const clientX = e.touches[0]?.clientX;
      if (clientX != null) updateRatio(clientX);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, {passive: false});

    onUnmounted(() => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    });
  });

  return ratio;
};
