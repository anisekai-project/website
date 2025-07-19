<template>
  <div class="layout">
    <slot/>
  </div>
</template>

<style lang="scss">

.layout {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  gap:             8px;

  height:          100vh;
  width:           100vw;
  padding:         1em;
}

</style>
