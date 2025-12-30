<template>
  <div class="page">
    <h1>Admin Panel</h1>
    <p class="subtitle">
      Use the password to access moderation and catalog management.
      <span v-if="state.loading">(syncing…)</span>
      <span v-else-if="state.error">({{ state.error }})</span>
      <span v-else>(connected)</span>
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

    <div v-else class="grid admin-grid">
      <section class="card card-wide">
        <header>
          <h2>Submissions</h2>
          <small>Edit entries.</small>
        </header>
        <ScoreTable
          title="Recent submissions"
          :items="submissions"
          showMode
        >
          <template #rowActions="{ entry }">
            <button class="danger" @click="deleteSubmission(entry.id)">Delete</button>
          </template>
        </ScoreTable>
      </section>

      <section class="card card-half">
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
          <label>
            Modes (comma separated)
            <input v-model="newGame.modes" placeholder="score, time-attack" />
          </label>
          <button type="submit">Add Game</button>
        </form>
        <ul class="item-list">
          <li v-for="game in state.games" :key="game.id">
            <div class="game-header">
              <div class="item-meta">
                <span>{{ game.name }} – {{ game.id }}</span>
                <small>Modes: {{ game.modes?.join(', ') || 'none' }}</small>
              </div>
              <button class="danger" @click="removeGame(game.id)" :disabled="state.loading">Remove</button>
            </div>

            <div class="mode-pills" v-if="game.modes?.length">
              <span
                v-for="mode in game.modes"
                :key="mode"
                class="mode-pill"
              >
                {{ mode }}
                <a type="button" class="pill-remove" @click="handleModeRemove(game.id, mode)">×</a>
              </span>
            </div>

            <form class="mode-form" @submit.prevent="handleModeAdd(game.id)">
              <input
                v-model="modeDraft[game.id]"
                placeholder="Add mode"
                aria-label="Add mode"
              />
              <button type="submit">Add</button>
            </form>

            <form class="theme-form" @submit.prevent="handleThemeSave(game.id)">
              <label>
                Background image URL
                <input
                  v-model="themeDraftFor(game).backgroundImage"
                  placeholder="https://images.example/arcade.jpg"
                />
              </label>
              <div class="theme-color-row">
                <label>
                  Accent color
                  <input
                    type="color"
                    v-model="themeDraftFor(game).accentColor"
                  />
                </label>
                <label>
                  Text color
                  <input
                    type="color"
                    v-model="themeDraftFor(game).textColor"
                  />
                </label>
              </div>
              <button type="submit">Save Theme</button>
            </form>
          </li>
        </ul>
      </section>

      <section class="card card-half">
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
            <div class="game-header">
              <span>{{ loc.name }} – {{ loc.id }}</span>
              <button class="danger" @click="removeLocation(loc.id)" :disabled="state.loading">Remove</button>
            </div>
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

const { submissionsWithMeta, deleteSubmission, state, addGame, removeGame, addLocation, removeLocation, addModeToGame, removeModeFromGame, updateGameTheme } = useArcadeStore();

const submissions = computed(() => submissionsWithMeta.value.slice(0, 20));

const newGame = reactive({ name: '', id: '', modes: '' });
const newLocation = reactive({ id: '', name: '' });
const modeDraft = reactive({});
const themeDraft = reactive({});

const themeDraftFor = (game) => {
  if (!themeDraft[game.id]) {
    themeDraft[game.id] = {
      backgroundImage: game.theme?.backgroundImage || '',
      accentColor: game.theme?.accentColor || '#38bdf8',
      textColor: game.theme?.textColor || '#f8fafc',
    };
  }
  return themeDraft[game.id];
};

const handleGameAdd = () => {
  const modes = newGame.modes
    .split(',')
    .map((mode) => mode.trim())
    .filter(Boolean);
  addGame({ ...newGame, modes });
  newGame.name = '';
  newGame.id = '';
  newGame.modes = '';
};

const handleLocationAdd = () => {
  addLocation({ ...newLocation });
  newLocation.id = '';
  newLocation.name = '';
};

const handleModeAdd = (gameId) => {
  const value = modeDraft[gameId]?.trim();
  if (!value) return;
  addModeToGame(gameId, value);
  modeDraft[gameId] = '';
};

const handleModeRemove = (gameId, mode) => {
  removeModeFromGame(gameId, mode);
};

const handleThemeSave = (gameId) => {
  const payload = themeDraft[gameId];
  if (!payload) return;
  updateGameTheme(gameId, { ...payload });
};
</script>
