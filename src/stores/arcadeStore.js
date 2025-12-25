import { reactive, computed } from 'vue';
import seed from '../data/seed.json';
import { fetchCollection, putRecord, deleteRecord, firebaseConfigured } from '../services/firebaseClient';

const seedSnapshot = {
  games: [...seed.games],
  locations: [...seed.locations],
  submissions: [...seed.submissions],
};

const state = reactive({
  games: [],
  locations: [],
  submissions: [],
  loading: false,
  error: null,
  usingFirebase: firebaseConfigured,
});

const hydrateFromSource = (snapshot) => {
  state.games = snapshot.games.map((game) => ({ ...game }));
  state.locations = snapshot.locations.map((location) => ({ ...location }));
  state.submissions = snapshot.submissions.map((submission) => ({ ...submission }));
};

const bootstrap = async () => {
  if (!firebaseConfigured) {
    hydrateFromSource(seedSnapshot);
    return;
  }

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
    hydrateFromSource(seedSnapshot);
  } finally {
    state.loading = false;
  }
};

bootstrap();

const clone = (items) => items.map((item) => ({ ...item }));
const replaceArray = (target, next) => {
  target.splice(0, target.length, ...next);
};

const newId = (prefix) => `${prefix}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9)}`;

const findIndex = (list, matcher) => list.findIndex(matcher);

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
    const score = Number(payload.score) || 0;
    const matcher = (sub) =>
      sub.gamertag === payload.gamertag &&
      sub.gameId === payload.gameId &&
      sub.locationId === payload.locationId;
    const existingIdx = findIndex(state.submissions, matcher);
    if (existingIdx !== -1 && state.submissions[existingIdx].score >= score) return;

    if (existingIdx !== -1) state.submissions.splice(existingIdx, 1);

    const submission = {
      id: newId('sub'),
      timestamp: new Date().toISOString(),
      ...payload,
      score,
    };
    state.submissions.unshift(submission);
    if (firebaseConfigured) await putRecord('submissions', submission);
  };

  const deleteSubmission = async (submissionId) => {
    const idx = findIndex(state.submissions, (sub) => sub.id === submissionId);
    if (idx !== -1) state.submissions.splice(idx, 1);
    if (firebaseConfigured) await deleteRecord('submissions', submissionId);
  };

  const addGame = async ({ id, code, name }) => {
    if (!name) return;
    const nextId = id || code || name.toUpperCase().replace(/\s+/g, '-');
    if (state.games.some((game) => game.id === nextId)) return;
    const record = { id: nextId, name };
    state.games.push(record);
    if (firebaseConfigured) await putRecord('games', record);
  };

  const removeGame = async (id) => {
    const idx = findIndex(state.games, (game) => game.id === id);
    if (idx !== -1) state.games.splice(idx, 1);
    replaceArray(
      state.submissions,
      state.submissions.filter((sub) => sub.gameId !== id),
    );
    if (firebaseConfigured) await deleteRecord('games', id);
  };

  const addLocation = async ({ id, name }) => {
    if (!id || !name || state.locations.some((loc) => loc.id === id)) return;
    state.locations.push({ id, name });
    if (firebaseConfigured) await putRecord('locations', { id, name });
  };

  const removeLocation = async (id) => {
    const idx = findIndex(state.locations, (loc) => loc.id === id);
    if (idx !== -1) state.locations.splice(idx, 1);
    replaceArray(
      state.submissions,
      state.submissions.filter((sub) => sub.locationId !== id),
    );
    if (firebaseConfigured) await deleteRecord('locations', id);
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
  };
};
