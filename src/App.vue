<template>
  <div class="shell" :class="{ 'full-bleed': fullBleed }">
    <header class="topbar">
      <span>Navdexi <small><i>V0.1</i></small></span>
      <nav>
        <RouterLink to="/scores">High Scores</RouterLink>
        <RouterLink to="/submit">Submit</RouterLink>
        <RouterLink to="/admin">Admin</RouterLink>
      </nav>
    </header>

    <main :class="{ 'full-bleed': fullBleed }">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();
const fullBleed = computed(() => ['GameLanding', 'GameLandingMode'].includes(route.name));
</script>
