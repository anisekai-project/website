<script lang="ts" setup>

import type {ColorScheme} from '~/types/types';
import {useCssVar}        from '@vueuse/core';

interface TrackBarProps {
  modelValue: number,
  color?: ColorScheme,
  minimum?: number
  maximum?: number,
  immediate?: boolean,
  mini?: boolean,
  step?: number | null
}

const props = withDefaults(defineProps<TrackBarProps>(), {
  color:     'highlight',
  minimum:   0,
  maximum:   100,
  immediate: false,
  mini:      false,
  step:      null
});

const state = reactive({
                         isDragging: false
                       });

const emits           = defineEmits(['update:model-value']);
const trackBarElement = useTemplateRef<HTMLDivElement>('track-bar-element');
const tracker         = useMouseTracker(trackBarElement);

const valueAtMousePosition = computed(() => props.minimum + tracker.value * (props.maximum - props.minimum));

const valueRatio = computed(() => {
  const range = props.maximum - props.minimum;
  if (range === 0) return 0;
  return (props.modelValue - props.minimum) / range;
});


const progress = useCssVar('--progress', trackBarElement, {initialValue: `${valueRatio.value * 100}%`});

watch(trackBarElement, () => {
  progress.value = `${valueRatio.value * 100}%`;
});

watch([valueAtMousePosition, valueRatio], () => {
  if (state.isDragging) {
    progress.value = `${tracker.value * 100}%`;
    if (props.immediate) {
      emits('update:model-value', valueAtMousePosition.value);
    }
  } else {
    progress.value = `${valueRatio.value * 100}%`;
  }
});

onMounted(() => {
  const endDrag = () => {
    if (!state.isDragging) return;
    state.isDragging = false;
    emits('update:model-value', valueAtMousePosition.value);
  };

  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);
});

const classes = computed(() => {
  const classes = [];
  classes.push(`scheme-${props.color}`);
  if (state.isDragging) classes.push('dragging');

  return classes;
});

function startDragging(event: MouseEvent | TouchEvent) {
  event.preventDefault();
  state.isDragging = true;
}
</script>

<template>
  <div ref="track-bar-element" class="track-bar" :class="classes">
    <div v-if="!mini" class="content">
      <slot/>
    </div>
    <div ref="bar-element" class="bar" @mousedown="startDragging" @touchstart="startDragging">
      <div class="progress"/>
    </div>
  </div>
</template>

<style lang="scss">

.track-bar {
  --progress:       0%;

  position:         relative;
  background-color: var(--scheme-background-lower);
  border:           2px solid var(--scheme-highlight);
  border-radius:    8px;
  color:            var(--scheme-white);
  cursor:           pointer;
  min-height:       14px;

  .content {
    position:       relative;
    z-index:        2;
    padding:        0.25em 0.75em;
    pointer-events: none;
  }

  .bar {
    z-index:  1;
    position: absolute;
    top:      2px;
    left:     2px;
    right:    2px;
    bottom:   2px;

    .progress {
      position:         relative;
      border-radius:    4px;
      height:           100%;
      width:            var(--progress);
      background-color: var(--x-scheme);
    }
  }

  &:not(.dragging) {
    .progress {
      transition: .1s width ease-in-out;
    }
  }
}

</style>
