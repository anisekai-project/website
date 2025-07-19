<template>
  <div class="application">
    <section class="content">
      <slot/>
    </section>
    <nav>
      <NuxtLink href="/" active-class="active">
        <Icon name="material-symbols:database-search-outline-rounded"/>
      </NuxtLink>
      <NuxtLink href="/schedule" active-class="active">
        <Icon name="material-symbols:calendar-clock-outline-rounded"/>
      </NuxtLink>
      <NuxtLink href="/rooms" active-class="active">
        <Icon name="material-symbols:connected-tv-outline-rounded"/>
      </NuxtLink>
      <NuxtLink href="/preview" active-class="active">
        <Icon name="material-symbols:bug-report-outline-rounded"/>
      </NuxtLink>
    </nav>
  </div>
</template>

<style lang="scss">

body, #__nuxt {
  width:          100%;
  display:        flex;
  flex-direction: column;
  align-items:    center;
}

.application {
  position:       relative;
  display:        flex;
  flex-direction: column;
  height:         100vh;
  width:          min(800px, 100%);
  margin:         0 auto;
  padding:        8px;
  gap:            8px;

  nav {
    position:         sticky;
    z-index:          100;
    bottom:           0;
    left:             0;
    right:            0;
    display:          flex;
    background-color: var(--scheme-background-lowest);
    align-items:      center;
    border:           2px solid var(--scheme-highlight);
    border-radius:    8px;
    padding:          2px;
    gap:              2px;

    a {
      padding:         8px 16px;
      border-radius:   4px;
      text-decoration: none;
      color:           var(--scheme-muted-white);
      display:         flex;
      flex-direction:  column;
      align-items:     center;
      justify-content: center;
      text-align:      center;
      width:           0;
      height:          100%;
      flex-grow:       1;
      gap:             4px;

      .iconify {
        font-size: 1.5em;
      }

      &:hover {
        background-color: var(--scheme-background-lightest);
        color:            var(--scheme-bright-white);
      }

      &.active {
        cursor:           default;
        background-color: var(--scheme-primary);
        color:            var(--scheme-bright-white);
      }
    }
  }

  .content {
    flex-grow:   1;
    overflow:    hidden;
    padding-top: 16px;
  }
}

</style>
