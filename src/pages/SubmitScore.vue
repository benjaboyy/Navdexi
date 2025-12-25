<template>
  <div class="page submit-form">
    <h1>Submit Score</h1>
    <p class="subtitle">
      API endpoint mirrors this form. Use this to test submissions.
      <span v-if="state.loading">(syncing…)</span>
    </p>

    <form class="card" @submit.prevent="handleSubmit">
      <label>
        Gamertag
        <input v-model="form.gamertag" required placeholder="Player name" />
      </label>

      <label>
        Game
        <select v-model="form.gameId" required @change="handleGameChange">
          <option disabled value="">Select game</option>
          <option v-for="game in state.games" :key="game.id" :value="game.id">{{ game.name }}</option>
        </select>
      </label>

      <label v-if="hasModes">
        Mode
        <select v-model="form.mode" :required="hasModes">
          <option value="">Select mode</option>
          <option v-for="mode in availableModes" :key="mode">{{ mode }}</option>
        </select>
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

      <button type="submit" :disabled="state.loading">Submit</button>
      <p v-if="submitted" class="note">Score submitted.</p>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useArcadeStore } from '../stores/arcadeStore';

const { addSubmission, state } = useArcadeStore();
const availableModes = computed(() => {
  const game = state.games.find((item) => item.id === form.gameId);
  return game?.modes || [];
});
const hasModes = computed(() => availableModes.value.length > 0);

const submitted = ref(false);
const error = ref('');

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

const handleGameChange = () => {
  if (!availableModes.value.includes(form.mode)) {
    form.mode = '';
  }
};

const handleSubmit = async () => {
  try {
    error.value = '';
    await addSubmission({ ...form });
    submitted.value = true;
    setTimeout(() => (submitted.value = false), 2000);
    resetForm();
  } catch (err) {
    error.value = err.message || 'Failed to submit score';
  }
};
</script>
