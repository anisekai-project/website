<script lang="ts" setup>

import {onClickOutside, until} from '@vueuse/core';
import type {AnisekaiTrack}    from '~/types/api';
import formattedDuration       from '~/utils/formattedDuration';

interface PlayerProps {
  mpd?: string | null,
  download?: string | null
  tracks?: AnisekaiTrack[],
  title?: string | null
}

const props = withDefaults(defineProps<PlayerProps>(), {
  mpd:      null,
  download: null,
  tracks:   () => [],
  title:    null
});

// Instances
const videoElement          = useTemplateRef<HTMLMediaElement>('videoElement');
const playerElement         = useTemplateRef<HTMLDivElement>('playerElement');
const settingsElement       = useTemplateRef<HTMLDivElement>('settingsElement');
const settingsButtonElement = useTemplateRef<HTMLButtonElement>('settingsButtonElement');
const media                 = useMediaPlayer(playerElement, videoElement);
const settings              = useToggle();
const loaded                = ref(false);
const api                   = useApi();

// Computed
const subtitles = computed(() => {
  return props.tracks.filter(track => track.type === 'SUBTITLE');
});

const currentTimeFormatted = computed(() => {
  return formattedDuration(media.controls.currentTime.value);
});

const totalTimeFormatted = computed(() => {
  return formattedDuration(media.controls.duration.value);
});

watch([media.controls.playing, settings.state, media.controls.ended], () => {
  media.activity.lock.value =
      !media.controls.playing.value ||
      settings.state.value ||
      media.controls.ended.value;
});

watch(() => props.mpd, () => loadPlayer());


onClickOutside(settingsElement, () => settings.toggle(), {ignore: [settingsButtonElement]});

const loadPlayer = async () => {
  if (!props.mpd) return;
  await media.playUrl(props.mpd);

  if (subtitles.value.length) {
    const sub = subtitles.value[0];
    await media.octopus.useSubtitle(sub);
  }

  loaded.value = true;
};

const focusPlayer = () => videoElement.value?.focus();

const onOverlayClick = () => {
  if (settings.state.value) {
    settings.close();
  } else {
    media.playPause();
  }
};

const togglePlayState = () => {
  settings.close();
  media.playPause();
};

const toggleFullscreen = () => {
  settings.close();
  media.fullscreen.toggle();

  if (media.fullscreen.isFullscreen) {
    // Shhhht, this one exists on some phones!
    if (screen.orientation.lock) {
      screen.orientation.lock('landscape');
    }
  } else {
    screen.orientation.unlock();
  }
};

const downloadFile = async () => {
  if (!props.download || !props.title) return;
  const blob = await api.downloadFile(props.download);

  const url       = URL.createObjectURL(blob);
  const a         = document.createElement('a');
  a.href          = url;
  a.download      = `${props.title}.mkv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function isMobileDevice(): boolean {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

onMounted(async () => {
  await until(media.shaka.ready).toBe(true);
  await loadPlayer();
});

/** Send to parent **/
const emits = defineEmits(['playStateChanged']);

watch([media.controls.ended, media.controls.playing], () => {
  if (media.controls.ended.value) {
    emits('playStateChanged', 'stopped');
    return;
  }
  emits('playStateChanged', media.controls.playing.value ? 'playing' : 'paused');
});

/** Extract things for v-model, v-if, v-show, etc... to work **/
const {state}                                         = settings;
const {duration, volume, currentTime, playing, muted} = media.controls;
const {isSupported, isFullscreen}                     = media.fullscreen;
const {audioTracks, player}                           = media.shaka;
const {active}                                        = media.activity;

</script>

<template>
  <div ref="playerElement" class="player" :class="{active: active}" @click="focusPlayer">
    <div class="video-container">
      <video ref="videoElement"/>
      <!-- This will help us capture any interaction with the video -->
      <div ref="overlayElement" class="overlay" @click="onOverlayClick" @dblclick="toggleFullscreen"/>
    </div>

    <div v-if="!media.shaka.ready || !mpd || !loaded" class="waiting">
      <Icon name="svg-spinners:180-ring-with-bg"/>
      <span v-if="!media.shaka.ready">Chargement du lecteur...</span>
      <span v-else-if="!mpd">Veuillez patienter...</span>
      <span v-else-if="!loaded">Chargement de la video...</span>
    </div>

    <div v-if="media.shaka.ready && mpd && loaded" class="player-controls">
      <div v-if="state" ref="settingsElement" class="player-settings">
        <section>
          <h6>Audio</h6>
          <button
              v-for="(audio, idx) in audioTracks"
              :key="idx"
              :class="{active: audio.active}"
              @click="player?.selectAudioTrack(audio)">
            {{ audio.label ?? audio.language }}
          </button>
        </section>
        <section>
          <h6>Sous-Titres</h6>
          <button :class="{active: media.octopus.activeTrack.value === null}" @click="media.octopus.useSubtitle(null)">
            Désactivés
          </button>
          <button
              v-for="(track, idx) in subtitles"
              :key="idx"
              :class="{active: track.id === media.octopus.activeTrack.value?.id}"
              @click="media.octopus.useSubtitle(track)">
            {{ track.name ?? track.language }}
          </button>
        </section>
      </div>

      <track-bar
          v-model="currentTime"
          class="tracker video-tracker"
          :minimum="0"
          :maximum="duration"
          color="cyan"
          mini/>
      <div class="main-controls">
        <button @click="togglePlayState">
          <Icon v-show="!playing" name="material-symbols:play-arrow-rounded"/>
          <Icon v-show="playing" name="material-symbols:pause-rounded"/>
        </button>

        <button @click="media.toggleMute">
          <Icon v-show="!muted" name="material-symbols:volume-up-rounded"/>
          <Icon v-show="muted" name="material-symbols:volume-off-rounded"/>
        </button>
        <track-bar
            v-if="!isMobileDevice()"
            v-model="volume"
            class="tracker"
            :minimum="0"
            :maximum="1"
            mini
            color="cyan"
            immediate/>

        <span class="duration">{{ currentTimeFormatted }} / {{ totalTimeFormatted }}</span>

        <button ref="settingsButtonElement" :class="{active: state}" @click="settings.toggle">
          <Icon name="material-symbols:settings-outline-rounded"/>
        </button>

        <button v-if="download" @click="downloadFile">
          <Icon name="material-symbols:download-rounded"/>
        </button>

        <button v-if="isSupported" @click="toggleFullscreen">
          <Icon v-show="isFullscreen" name="material-symbols:fullscreen-rounded"/>
          <Icon v-show="!isFullscreen" name="material-symbols:fullscreen-exit-rounded"/>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

.player {
  max-height:            80vh;
  aspect-ratio:          16/9;
  position:              relative;
  overflow:              hidden;
  border-radius:         8px;
  background-color:      var(--scheme-background-lowest);
  cursor:                none;

  --transition-duration: 0.35s;
  --transition-function: ease-in-out;

  transition:            border-radius var(--transition-duration) var(--transition-function);

  .waiting {
    position:        absolute;
    display:         flex;
    flex-direction:  column;
    align-items:     center;
    justify-content: center;
    gap:             8px;
    font-size:       1.3em;
    z-index:         2;
    top:             0;
    bottom:          0;
    left:            0;
    right:           0;

    .iconify {
      font-size: 1.8em;
    }
  }

  .video-container {
    /* Ugly fix because line returns have a size on Firefox */
    font-size: 0;
    position:  relative;
    height:    100%;

    video {
      position:     relative;
      width:        100%;
      height:       100%;
      aspect-ratio: 16/9;
      z-index:      1;
      cursor:       none;
    }

    .overlay {
      position: absolute;
      z-index:  2;
      top:      0;
      bottom:   0;
      left:     0;
      right:    0;
    }

    .libassjs-canvas {
      z-index: 5;
    }
  }

  .tracker {
    height:        16px;

    border-radius: 100px;

    .progress {
      border-radius: 100px;
    }

  }

  .player-controls {
    position:       absolute;
    z-index:        10;
    display:        flex;
    flex-direction: column;
    align-items:    stretch;
    gap:            4px;
    bottom:         0;
    left:           8px;
    right:          8px;
    transform:      translateY(100%);
    opacity:        0;
    pointer-events: none;
    max-height:     calc(100% - 16px);

    transition:     bottom var(--transition-duration) var(--transition-function),
                    transform var(--transition-duration) var(--transition-function),
                    opacity var(--transition-duration) var(--transition-function);

    & > * {
      pointer-events: all;
    }

    .main-controls {
      display:          flex;
      background-color: var(--scheme-background-lower);
      border-radius:    8px;
      padding:          2px;
      border:           2px solid var(--scheme-highlight);
      align-items:      center;

      .tracker {
        margin-left: 4px;
        width:       150px;
      }

      button {
        aspect-ratio:  1/1;
        background:    none;
        border:        none;
        color:         white;
        font-size:     1.25em;
        padding:       6px;
        border-radius: 4px;
        display:       flex;
        align-items:   center;
        justify-items: center;
        cursor:        pointer;

        transition:    background .1s var(--transition-function);

        &:hover {
          background-color: var(--scheme-highlight)
        }

        &.active {
          background-color: var(--scheme-primary)
        }
      }
    }

    .duration {
      margin:    0 8px 0 auto;
      font-size: 0.9em;
    }

    .player-settings {
      align-self:       end;
      max-width:        min(300px, 100%);
      min-width:        min(150px, 100%);

      background-color: var(--scheme-background-lower);
      border-radius:    8px;
      padding:          2px;
      border:           2px solid var(--scheme-highlight);
      text-align:       right;
      display:          flex;
      flex-direction:   column;
      gap:              16px;
      height:           auto;
      overflow-y:       auto;

      h6 {
        text-transform: uppercase;
        padding:        2px 8px;
        color:          var(--scheme-muted-white);
      }

      section {
        display:        flex;
        flex-direction: column;
        gap:            2px;
      }

      button {
        background:    none;
        border:        none;
        font-size:     1em;
        border-radius: 4px;
        cursor:        pointer;
        padding:       2px 8px;
        display:       block;
        color:         var(--scheme-white);
        text-align:    right;
        align-self:    stretch;

        &:hover {
          background-color: var(--scheme-highlight);
        }

        &.active {
          background-color: var(--scheme-muted-cyan);
          font-weight:      bold;
        }
      }
    }
  }

  &.active {
    border-radius: 12px;
    cursor:        default;

    .player-controls {
      bottom:    8px;
      transform: translateY(0);
      opacity:   0.8;

      &:hover {
        opacity: 1;
      }
    }
  }

}

</style>
