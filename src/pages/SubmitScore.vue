<template>
  <div class="page">
    <h1>Submit Score</h1>
    <p class="subtitle">API endpoint mirrors this form. Use this to test submissions.</p>

    <form class="card" @submit.prevent="handleSubmit">
      <label>
        Gamertag
        <input v-model="form.gamertag" required placeholder="Player name" />
      </label>

      <label>
        Game
        <select v-model="form.gameId" required>
          <option disabled value="">Select game</option>
          <option v-for="game in state.games" :key="game.id" :value="game.id">{{ game.name }}</option>
        </select>
      </label>

      <label>
        Mode
        <input v-model="form.mode" placeholder="e.g. survival" />
      </label>

      <label>
        Location
        <select v-model="form.locationId" required>
          <option disabled value="">Select location</option>
          <option v-for="loc in state.locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
        </select>
      </label>

      <label>
        Score
        <input v-model.number="form.score" type="number" min="0" required />
      </label>

      <button type="submit">Submit</button>
      <p v-if="submitted" class="note">Score submitted locally.</p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useArcadeStore } from '../stores/arcadeStore';

const { addSubmission, state } = useArcadeStore();
const submitted = ref(false);

const form = reactive({
  gamertag: '',
  gameId: '',
  mode: '',
  locationId: '',
  score: 0,
});

const resetForm = () => {
  form.gamertag = '';
  form.gameId = '';
  form.mode = '';
  form.locationId = '';
  form.score = 0;
};

const handleSubmit = () => {
  addSubmission({ ...form });
  submitted.value = true;
  setTimeout(() => (submitted.value = false), 2000);
  resetForm();
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  background: #fff;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 600;
}

input,
select {
  border-radius: 8px;
  border: 1px solid #d4d4d8;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}

button {
  margin-top: 0.5rem;
}

.note {
  color: #16a34a;
  margin: 0;
}
</style>

