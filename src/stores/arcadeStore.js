import { reactive, computed, ref } from 'vue';
import { fetchCollection, putRecord, deleteRecord, firebaseConfigured } from '../services/firebaseClient';

const state = reactive({
  games: [],
  locations: [],
  submissions: [],
  loading: false,
  error: null,
});

const missingConfigMessage = 'Firebase URL missing. Set VITE_FIREBASE_URL in your .env file.';
if (!firebaseConfigured) state.error = missingConfigMessage;

const requireFirebase = () => {
  if (!firebaseConfigured) throw new Error(missingConfigMessage);
};

const normalizeGame = (game) => ({
  ...game,
  modes: Array.isArray(game.modes) ? [...game.modes] : [],
});

const hydrateFromSource = (snapshot) => {
  state.games.splice(0, state.games.length, ...snapshot.games.map(normalizeGame));
  state.locations.splice(0, state.locations.length, ...snapshot.locations.map((location) => ({ ...location })));
  state.submissions.splice(0, state.submissions.length, ...snapshot.submissions.map((submission) => ({ ...submission })));
};

const bootstrap = async () => {
  if (!firebaseConfigured) return;
  state.loading = true;
  state.error = null;
  try {
    const [games, locations, submissions] = await Promise.all([
      fetchCollection('games'),
      fetchCollection('locations'),
      fetchCollection('submissions'),
    ]);
    hydrateFromSource({ games, locations, submissions });
  } catch (err) {
    state.error = err.message;
  } finally {
    state.loading = false;
  }
};

bootstrap();

const replaceArray = (target, next) => {
  target.splice(0, target.length, ...next);
};

const newId = (prefix) => `${prefix}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9)}`;

const findIndex = (list, matcher) => list.findIndex(matcher);

const updateGameRecord = async (gameId, updater) => {
  const idx = findIndex(state.games, (game) => game.id === gameId);
  if (idx === -1) return;
  const next = { ...state.games[idx] };
  updater(next);
  state.games.splice(idx, 1, next);
  await putRecord('games', next);
};

const modeDraft = reactive({});
const selectedGame = ref('');
const selectedGameModes = computed(() => state.games.find((game) => game.id === selectedGame.value)?.modes || []);

export const useArcadeStore = () => {
  const highscoresByGame = computed(() => state.games.map((game) => ({
    ...game,
    scores: state.submissions
      .filter((sub) => sub.gameId === game.id)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10),
  })));

  const submissionsWithMeta = computed(() => state.submissions.map((entry) => ({
    ...entry,
    gameName: state.games.find((game) => game.id === entry.gameId)?.name || entry.gameId,
    locationName: state.locations.find((loc) => loc.id === entry.locationId)?.name || entry.locationId,
  })));

  const addSubmission = async (payload) => {
    requireFirebase();
    const score = Number(payload.score) || 0;
    const matcher = (sub) =>
      sub.gamertag === payload.gamertag &&
      sub.gameId === payload.gameId &&
      sub.locationId === payload.locationId;
    const existingIdx = findIndex(state.submissions, matcher);
    if (existingIdx !== -1 && state.submissions[existingIdx].score >= score) {
      throw new Error('A higher score already exists for this player at this location.');
    }

    if (existingIdx !== -1) state.submissions.splice(existingIdx, 1);

    const submission = {
      id: newId('sub'),
      timestamp: new Date().toISOString(),
      ...payload,
      score,
    };
    state.submissions.unshift(submission);
    await putRecord('submissions', submission);
  };

  const deleteSubmission = async (submissionId) => {
    requireFirebase();
    const idx = findIndex(state.submissions, (sub) => sub.id === submissionId);
    if (idx !== -1) state.submissions.splice(idx, 1);
    await deleteRecord('submissions', submissionId);
  };

  const addGame = async ({ id, code, name, modes = [] }) => {
    requireFirebase();
    if (!name) return;
    const nextId = id || code || name.toUpperCase().replace(/\s+/g, '-');
    if (state.games.some((game) => game.id === nextId)) return;
    const record = normalizeGame({ id: nextId, name, modes });
    state.games.push(record);
    await putRecord('games', record);
  };

  const removeGame = async (id) => {
    requireFirebase();
    const idx = findIndex(state.games, (game) => game.id === id);
    if (idx !== -1) state.games.splice(idx, 1);
    replaceArray(
      state.submissions,
      state.submissions.filter((sub) => sub.gameId !== id),
    );
    await deleteRecord('games', id);
  };

  const addLocation = async ({ id, name }) => {
    requireFirebase();
    if (!id || !name || state.locations.some((loc) => loc.id === id)) return;
    state.locations.push({ id, name });
    await putRecord('locations', { id, name });
  };

  const removeLocation = async (id) => {
    requireFirebase();
    const idx = findIndex(state.locations, (loc) => loc.id === id);
    if (idx !== -1) state.locations.splice(idx, 1);
    replaceArray(
      state.submissions,
      state.submissions.filter((sub) => sub.locationId !== id),
    );
    await deleteRecord('locations', id);
  };

  const addModeToGame = async (gameId, mode) => {
    requireFirebase();
    if (!mode) return;
    await updateGameRecord(gameId, (game) => {
      if (!game.modes.includes(mode)) game.modes.push(mode);
    });
  };

  const removeModeFromGame = async (gameId, mode) => {
    requireFirebase();
    if (!mode) return;
    await updateGameRecord(gameId, (game) => {
      game.modes = game.modes.filter((item) => item !== mode);
    });
  };

  return {
    state,
    highscoresByGame,
    submissionsWithMeta,
    addSubmission,
    deleteSubmission,
    addGame,
    removeGame,
    addLocation,
    removeLocation,
    addModeToGame,
    removeModeFromGame,
    selectedGame,
    selectedGameModes,
  };
};
