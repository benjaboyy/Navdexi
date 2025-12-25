<template>
  <div class="shell">
    <header class="topbar">
      <img src="/vite.svg" alt="Navdexi" />
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

<style scoped>
.shell {
  min-height: 100vh;
  background: #f4f4f5;
  color: #111827;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e4e4e7;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  font-weight: 600;
  color: #4b5563;
  text-decoration: none;
}

nav a.router-link-active {
  color: #111827;
}

main {
  max-width: 1024px;
  margin: 0 auto;
  padding: 2rem;
}

img {
  height: 32px;
}
</style>
