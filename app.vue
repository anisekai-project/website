<template>
  <NuxtLayout :name="layout">
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type {User} from "~/types/api";

const user = useState<User | null>('authenticated_user', () => null);
const layout = computed(() => user.value ? 'logged' : 'default')

</script>
