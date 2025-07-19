export type NavigationKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Enter' | 'Escape' | 'Tab';
export type NavigationType = 'vertical' | 'horizontal';

const isNavigationKey = (key: string): key is NavigationKey => [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  'Escape',
  'Tab'
].includes(key);

const noop     = () => {};
const noopBool = () => false;

export default (
  type: NavigationType,
  count: Ref<number>,
  element: Ref<HTMLElement | null>,
  onConfirm: (shift: boolean) => void,
  onCancel: (shift: boolean) => void = noop,
  onTab: (shift: boolean) => boolean = noopBool
) => {
  const index: Ref<number | null> = ref(null);

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isNavigationKey(event.key)) return;

    // Special case here
    if (event.key === 'Tab') {
      if (onTab(event.shiftKey)) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    switch (event.key) {
      case 'ArrowDown':
        if (type === 'horizontal') break;
        index.value = Math.min((index.value ?? -1) + 1, count.value - 1);
        break;
      case 'ArrowUp':
        if (type === 'horizontal') break;
        index.value = Math.max((index.value ?? 1) - 1, 0);
        break;
      case 'ArrowRight':
        if (type === 'vertical') break;
        index.value = Math.min((index.value ?? -1) + 1, count.value - 1);
        break;
      case 'ArrowLeft':
        if (type === 'vertical') break;
        index.value = Math.max((index.value ?? 1) - 1, 0);
        break;
      case 'Enter':
        onConfirm(event.shiftKey);
        break;
      case 'Escape':
        onCancel(event.shiftKey);
        break;
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (!isNavigationKey(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return {onKeyDown, onKeyUp, index};
};
