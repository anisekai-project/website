<script setup lang="ts">

import type {EpisodeDescriptor}       from '~/types/api';
import type {RouteLocationNormalized} from '#vue-router';

const route  = useRoute();
const router = useRouter();
const api    = useApi();
const config = useRuntimeConfig();

const routeValidator = (route: RouteLocationNormalized): boolean => {
  return route.params.episode !== null && !isNaN(Number(route.params.episode));
};

const retrieveEpisodeDescriptor: () => Promise<EpisodeDescriptor | null> = async () => {
  const response = await api.get<EpisodeDescriptor>(`/api/v3/episodes/${route.params.episode}/descriptor`);

  if (response.isSuccessful) {
    return response.data;
  }

  await router.push('/');
  return null;
};

const descriptor: Ref<EpisodeDescriptor | null> = ref(null);

const mpd = computed(() => {
  if (descriptor.value) {
    return `${config.public.apiUrl}${descriptor.value?.mpd}`;
  }
  return null;
});

const download = computed(() => {
  if (descriptor.value) {
    return `${config.public.apiUrl}${descriptor.value?.download}`;
  }
  return null;
});

const tracks  = computed(() => descriptor.value?.tracks || []);
const title   = computed(() => descriptor.value?.anime);
const episode = computed(() => descriptor.value?.number);

const fullTitle = computed(() => `${title.value} - Épisode ${episode.value}`)

onMounted(async () => {
  descriptor.value = await retrieveEpisodeDescriptor();

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata(
        {
          title:  title.value,
          artist: `Épisode ${episode.value}`,
          album:  'Anisekai'
        });
  }
});

definePageMeta({validate: routeValidator});
</script>

<template>
  <div class="page">
    <anisekai-player :mpd="mpd" :download="download" :tracks="tracks" :title="fullTitle"/>
    <section>
      <h1 v-if="title">{{ title }}</h1>
      <h3 v-if="episode">Épisode {{ episode }}</h3>
    </section>
  </div>

</template>

<style lang="scss" scoped>
section {
  margin-top: 8px;
}
</style>
