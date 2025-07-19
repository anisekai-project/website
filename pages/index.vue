<script setup lang="ts">

import type {Anime, SpringError} from "~/types/api";
import {useInfiniteScroll} from "@vueuse/core";

const animes: Ref<Anime[]> = ref([]);
const memory: Ref<Anime[]> = ref([])
const loading: Ref<boolean> = ref(true);
const error: Ref<SpringError | null> = ref(null);

const api = useApi();

onMounted(async () => {

  const response = await api.get<Anime[]>('/api/v3/animes/watchable');

  if (response.isSuccessful) {
    memory.value = response.data;
  } else {
    error.value = response.error;
  }
  loadMoreItems();
  loading.value = false;
});

function loadMoreItems() {
  const items: Anime[] = memory.value.splice(0, 20);
  animes.value.push(...items);
}

const element = useTemplateRef<HTMLDivElement>('list');
const container = useTemplateRef<HTMLDivElement>('scroll');

useInfiniteScroll(container, () => loadMoreItems(), {
  distance: 10,
  canLoadMore: () => {
    return memory.value.length > 0;
  }
});


definePageMeta({
  middleware: 'auth'
})
</script>

<template>
  <div class="collection" ref="scroll">
    <h1>Collection</h1>

    <div class="items" v-if="!loading && !error" ref="list">
      <p class="notice">Les animes d'une même licence sont affichés dans l'ordre recommandé de visionnage.</p>
      <anime v-for="anime in animes" :key="anime.id" :anime="anime"></anime>
    </div>

    <div v-if="loading || memory?.length > 0" class="waiting">
      <Icon name="svg-spinners:180-ring-with-bg"/>
      <span>Chargement des animes...</span>
    </div>

    <div v-if="error" class="waiting">
      <Icon name="material-symbols:error-outline-rounded"/>
      <span>Une erreur est survenue</span>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<style lang="scss">

.collection {
  max-height: 100%;
  overflow-y: auto;

  .waiting {
    display:        flex;
    flex-direction: column;
    align-items:    center;
    padding:        2em;
    gap:            8px;

    .iconify {
      font-size: 2em;
    }
  }

  .items {
    display:        flex;
    flex-direction: column;
    gap:            8px;
  }
}

</style>
