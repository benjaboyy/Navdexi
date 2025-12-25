<template>
  <div class="page">
    <h1>Admin Panel</h1>
    <p class="subtitle">
      Use the password to access moderation and catalog management.
      <span v-if="state.loading">(syncing…)</span>
      <span v-else-if="state.usingFirebase">(Firebase live)</span>
      <span v-else>(local mock)</span>
    </p>

    <section v-if="!authed" class="card">
      <form @submit.prevent="verify">
        <label>
          Admin Pass
          <input v-model="password" type="password" placeholder="Enter admin password" required />
        </label>
        <button type="submit">Unlock</button>
        <p v-if="error" class="error">Incorrect password.</p>
      </form>
    </section>

    <div v-else class="grid">
      <section class="card">
        <header>
          <h2>Submissions</h2>
          <small>Delete unwanted entries.</small>
        </header>
        <ScoreTable
          title="Recent submissions"
          :items="submissions"
          show-mode
        >
          <template #rowActions="{ entry }">
            <button class="danger" @click="deleteSubmission(entry.id)">Delete</button>
          </template>
        </ScoreTable>
      </section>

      <section class="card">
        <header>
          <h2>Games</h2>
        </header>
        <form @submit.prevent="handleGameAdd" class="stack">
          <label>
            Name
            <input v-model="newGame.name" required />
          </label>
          <label>
            ID (optional)
            <input v-model="newGame.id" placeholder="auto if empty" />
          </label>
          <button type="submit">Add Game</button>
        </form>
        <ul class="item-list">
          <li v-for="game in state.games" :key="game.id">
            <span>{{ game.name }} – {{ game.id }}</span>
            <button class="danger" @click="removeGame(game.id)" :disabled="state.loading">Remove</button>
          </li>
        </ul>
      </section>

      <section class="card">
        <header>
          <h2>Locations</h2>
        </header>
        <form @submit.prevent="handleLocationAdd" class="stack">
          <label>
            ID
            <input v-model="newLocation.id" required />
          </label>
          <label>
            Name
            <input v-model="newLocation.name" required />
          </label>
          <button type="submit">Add Location</button>
        </form>
        <ul class="item-list">
          <li v-for="loc in state.locations" :key="loc.id">
            <span>{{ loc.name }} – {{ loc.id }}</span>
            <button class="danger" @click="removeLocation(loc.id)" :disabled="state.loading">Remove</button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import ScoreTable from '../components/ScoreTable.vue';
import { useArcadeStore } from '../stores/arcadeStore';

const adminPass = import.meta.env.VITE_ADMIN_PASS || 'changeme';
const password = ref('');
const error = ref(false);
const authed = ref(false);

const verify = () => {
  const ok = password.value && password.value === adminPass;
  authed.value = ok;
  error.value = !ok;
  if (ok) password.value = '';
};

const { submissionsWithMeta, deleteSubmission, state, addGame, removeGame, addLocation, removeLocation } = useArcadeStore();

const submissions = computed(() => submissionsWithMeta.value.slice(0, 20));

const newGame = reactive({ name: '', id: '' });
const newLocation = reactive({ id: '', name: '' });

const handleGameAdd = () => {
  addGame({ ...newGame });
  newGame.name = '';
  newGame.id = '';
};

const handleLocationAdd = () => {
  addLocation({ ...newLocation });
  newLocation.id = '';
  newLocation.name = '';
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subtitle {
  color: #6b7280;
}

.card {
  padding: 1.5rem;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  background: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 600;
}

input {
  border-radius: 8px;
  border: 1px solid #d4d4d8;
  padding: 0.5rem 0.75rem;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f4f4f5;
}

.item-list li:last-child {
  border-bottom: none;
}

.danger {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.error {
  color: #dc2626;
}
</style>
