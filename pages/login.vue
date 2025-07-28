<script lang="ts" setup>

const {authenticate} = useAnisekai();
const router         = useRouter();

const search                    = new URLSearchParams(window.location.search);
const error: Ref<string | null> = ref(null);

if (search.has('code')) {

  try {
    if (await authenticate()) {
      const router = useRouter();
      router.push('/');
    }
  } catch (e) {
    error.value = JSON.stringify(e, null, 2);
  }
}
</script>
<template>
  <h1>Hey!</h1>
  <p>Pour utiliser le site, il faut être connecté!</p>
  <anisekai-button @click="authenticate(true)" left-icon="material-symbols:login-rounded" text="Se connecter"
                   type="primary"/>
  <pre v-if="error">{{ error }}</pre>
</template>

<style scoped>
h1 {
  text-align: center;
  width:      50%
}
</style>
