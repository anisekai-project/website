import type {WatchSource} from 'vue';

export default <T>(source: WatchSource<T>, callback: (value: T) => Promise<void> | void, timeout: number): {
  action: (value: T) => void,
  debounce: (value: T) => void
} => {
  let timeoutId: number | null = null;

  const action = async (value: T) => {
    const res = callback(value);
    if (res) {
      await res;
    }

    timeoutId = null;
  };

  const debounce = (value: T) => {
    if (timeoutId != null) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => action(value), timeout);
  };

  watch(source, value => debounce(value));
  return {action, debounce};
}
