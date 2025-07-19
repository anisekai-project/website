<script setup lang="ts">

import type {Anime, Episode} from '~/types/api';

const config = useRuntimeConfig();

interface AnimeProps {
  anime: Anime,
  noLink?: boolean
}

const props           = withDefaults(defineProps<AnimeProps>(), {
  noLink: false
});
const {state, toggle} = useToggle();

const toEpisodeLink = (episode: Episode) => props.noLink ? undefined : `/watch/${episode.id}`;

const image = computed(() => `${config.public.apiUrl}${props.anime.imageUrl}`);

</script>

<template>
  <div class="anime">
    <div class="meta" @click="toggle">
      <img :src="image" :alt="anime.title"/>
      <h3 class="title">{{ anime.title }}</h3>
      <span>{{ anime.episodes.length }} Épisode(s)</span>
    </div>

    <div class="dropdown" v-if="state">
      <NuxtLink v-for="episode in anime.episodes" :key="episode.id" :href="toEpisodeLink(episode)">
        Épisode {{ episode.number }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="scss">

.anime {
  background-color: var(--scheme-background-lower);
  border:           2px solid var(--scheme-highlight);
  border-radius:    8px;
  overflow:         hidden;

  .meta {
    position:  relative;
    padding:   8px;
    max-width: 100%;
    overflow:  hidden;
    cursor:    pointer;

    img {
      position:       absolute;
      opacity:        0.2;
      top:            0;
      left:           0;
      width:          100%;
      height:         100%;
      object-fit:     cover;
      z-index:        1;
      pointer-events: none;
    }

    h3 {
      font-weight: 900;
    }

    span {
      font-weight: 300;
      color:       var(--scheme-muted-white)
    }

    :not(img) {
      z-index:  2;
      position: relative;
    }
  }

  .dropdown {
    display:        flex;
    flex-direction: column;

    a {
      padding:         8px 16px;
      color:           var(--scheme-muted-white);
      text-decoration: none;

      &:hover {
        background-color: var(--scheme-highlight);
        color:            white;
      }
    }
  }
}


</style>
