<template>
  <div class="shell">
    <header class="topbar">
      <span>Navdexi <small><i>V0.1</i></small></span>
      <nav>
        <RouterLink to="/scores">High Scores</RouterLink>
        <RouterLink to="/submit">Submit</RouterLink>
        <RouterLink to="/admin">Admin</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>
