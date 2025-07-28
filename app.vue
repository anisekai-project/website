<template>
  <NuxtLayout :name="layout">
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
const {user} = useAnisekai();
const layout         = computed(() => user.value ? 'logged' : 'default');
</script>
