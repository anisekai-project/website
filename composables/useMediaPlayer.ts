import {type KeyFilter, onKeyStroke, useFullscreen, useMediaControls} from '@vueuse/core';
import type {AnisekaiTrack}                                           from '~/types/api';
import {watchOnce}                                                    from '@vueuse/shared';

// Maybe I'll do a complete typing of it later.
interface SubtitleOctopus {
  dispose: () => void;
}

function useSubtitleOctopus(video: Ref<HTMLMediaElement | null>) {

  const octopus: Ref<SubtitleOctopus | null>   = ref(null);
  const isAvailable                            = computed(() => octopus != null);
  const activeTrack: Ref<AnisekaiTrack | null> = ref(null);

  const api = useApi();

  const dispose = () => {
    if (octopus.value) {
      octopus.value.dispose();
      octopus.value = null;
    }
  };

  const useSubtitle = async (track: AnisekaiTrack | null) => {
    if (!video.value) {
      console.error('SubtitleOctopus', 'useSubtitle()', 'Tried to load subtitles without the video element being ready.');
      return;
    }

    // Check if any action is needed.
    if (track === null && activeTrack.value === null) return;
    if (track !== null && activeTrack.value !== null && activeTrack.value.id === track.id) return;

    dispose();
    if (track == null) {
      activeTrack.value = null;
      return;
    }

    const subs = await api.fetch<string>(`/api/v3/library/subtitles/${track.id}`);

    octopus.value = new SubtitlesOctopus(
      {
        video:           video.value,
        subContent:      subs,
        fonts:           ['/assets/fonts/trebuc.ttf'],
        workerUrl:       '/lib/subtitles-octopus/subtitles-octopus-worker.js',
        legacyWorkerUrl: '/lib/subtitles-octopus/subtitles-octopus-worker-legacy.js',
        renderMode:      'wasm-blend',
        targetFps:       24,
        onReady:         () => console.log('SubtitleOctopus', 'useSubtitle()', 'Octopus ready.'),
        onError:         (e: Error) => console.error('SubtitleOctopus', 'useSubtitle()', e)
      }) as SubtitleOctopus;

    activeTrack.value = track;
  };

  onUnmounted(() => dispose());
  return {useSubtitle, isAvailable, activeTrack};
}

function useShaka(video: Ref<HTMLMediaElement | null>) {

  const token = useCookie('token');

  const instance: Ref<shaka.Player | null>          = ref(null);
  const ready: Ref<boolean>                         = ref(false);
  const audioTracks: Ref<shaka.extern.AudioTrack[]> = ref([]);

  onMounted(async () => {
    instance.value = new shaka.Player();

    instance.value.addEventListener('audiotrackschanged', () => {
      audioTracks.value = instance.value?.getAudioTracks() || [];
    });

    const engine = instance.value.getNetworkingEngine();

    if (engine) {
      engine.registerRequestFilter((type, request) => {
        if (
          type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
          type === shaka.net.NetworkingEngine.RequestType.SEGMENT
        ) {
          if (token.value) {
            request.headers['Authorization'] = `Bearer ${token.value}`;
          }
        }
      });
    }

    const doWatch = () => {
      watchOnce(video, (v) => {
        if (v) {
          if (!instance.value) return;
          instance.value.attach(v)
                  .then(() => ready.value = true)
                  .catch(err => console.error('Shaka attach failed:', err));
        }
      });
    };

    if (video.value) {
      try {
        await instance.value.attach(video.value);
        ready.value = true;
      } catch (err) {
        console.error('Shaka attach failed:', err);
      }
    } else {
      doWatch();
    }
  });

  onUnmounted(() => {
    instance.value?.destroy().catch(console.error);
  });

  return {player: instance, audioTracks, ready};
}

export function useMediaPlayer(container: Ref<HTMLDivElement | null>, video: Ref<HTMLMediaElement | null>) {

  const settings = {
    volume: 'anisekai.player.volume',
    muted:  'anisekai.player.muted'
  };

  // Instances
  const octopus    = useSubtitleOctopus(video);
  const controls   = useMediaControls(video);
  const fullscreen = useFullscreen(container);
  const shaka      = useShaka(video);
  const activity   = useActivity(container, 3);

  // Utilities
  const onKey = (key: KeyFilter, action: () => void) => {
    onKeyStroke(key, (event) => {
      action();
      event.preventDefault();
      event.stopPropagation();
    }, {target: container});
  };

  const relativeTime = (seconds: number) => {
    const duration             = controls.duration.value || 0;
    const value                = controls.currentTime.value + seconds;
    controls.currentTime.value = Math.max(0, Math.min(duration, value));
  };

  const relativeVolume = (amount: number) => {
    const value           = controls.volume.value + amount;
    controls.volume.value = Math.max(0, Math.min(1, value));
  };

  // Keyboard handlers
  onKey(' ', () => controls.playing.value = !controls.playing.value);
  onKey('ArrowLeft', () => relativeTime(-5));
  onKey('ArrowRight', () => relativeTime(5));
  onKey('ArrowDown', () => relativeVolume(-0.05));
  onKey('ArrowUp', () => relativeVolume(0.05));

  // Preferences
  watch(controls.volume, (value: number) => localStorage.setItem(settings.volume, `${value}`));
  watch(controls.muted, (value: boolean) => localStorage.setItem(settings.muted, value ? '1' : '0'));

  function isMobileDevice(): boolean {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  // Hello, World!
  onMounted(() => {
    if (isMobileDevice()) {
      controls.volume.value = 1;
    } else {
      controls.volume.value = parseFloat(localStorage.getItem(settings.volume) ?? '1');
    }
    controls.muted.value = parseInt(localStorage.getItem(settings.muted) ?? '0') === 1;
  });

  // Exposable Methods
  const playUrl = async (url: string) => {
    await shaka.player.value?.load(url);
  };

  // Things that get used so often, they deserve their own little methods :3
  const playPause  = () => controls.playing.value = !controls.playing.value;
  const toggleMute = () => controls.muted.value = !controls.muted.value;

  return {octopus, controls, fullscreen, shaka, activity, playUrl, playPause, toggleMute};
}
