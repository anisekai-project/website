const noop = () => true;

export default (beforeOpen: () => boolean = noop, beforeClose: () => boolean = noop) => {

  const state: Ref<boolean> = ref(false);

  const open = () => {
    if (beforeOpen()) {
      state.value = true;
      return;
    }
  };

  const close = () => {
    if (beforeClose()) {
      state.value = false;
      return;
    }
  };

  const toggle = () => {
    if (state.value) {
      close();
    } else {
      open();
    }
  };

  return {state, open, close, toggle};
}
