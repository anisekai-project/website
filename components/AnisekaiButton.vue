<script lang="ts" setup>

import type {ColorScheme} from "~/types/types";

interface ButtonProperties {
  text: string
  type?: ColorScheme,
  leftIcon?: string | null,
  rightIcon?: string | null
}

const props = withDefaults(defineProps<ButtonProperties>(), {
  type: 'highlight',
  leftIcon: null,
  rightIcon: null
});

const classes = computed(() => {
  return [`scheme-${props.type}`]
})

</script>

<template>
  <button :class="classes">{{ text }}</button>
</template>

<style lang="scss">

button {
  display:          flex;
  border:           none;
  color:            white;
  font-size:        1em;
  padding:          0.5em 1em;
  border-radius:    8px;
  background-color: var(--x-scheme);
  cursor:           pointer;

  &:hover {
    background-color: var(--x-scheme-hover);
  }

  &:active {
    background-color: var(--x-scheme-bright-hover);
  }
}


</style>
