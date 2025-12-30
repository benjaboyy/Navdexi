<template>
  <div class="landing-shell" :style="pageStyle">
    <div class="landing-overlay">
      <div class="landing-container">
        <RouterLink class="back-link" to="/scores">← High Scores</RouterLink>

        <section class="landing-hero">
          <h1>{{ game?.name || route.params.gameId }}</h1>
          <p class="mode-label" v-if="activeMode">Mode • <span>{{ activeMode }}</span></p>
          <p class="mode-label" v-else-if="game?.modes?.length">{{ game.modes.length }} mode(s) available</p>
          <div class="hero-meta" v-if="game">
            <span>ID: {{ game.id }}</span>
            <span v-if="topScore">Top score: {{ topScore.score.toLocaleString() }}</span>
            <span v-if="topScore">By {{ topScore.gamertag }}</span>
          </div>
        </section>

        <nav v-if="game?.modes?.length" class="mode-nav">
          <RouterLink
              :class="['pill', { active: !activeMode }]"
              :style="pillStyle"
              :to="{ name: 'GameLanding', params: { gameId: game.id } }"
          >
            Overall
          </RouterLink>
          <RouterLink
              v-for="mode in game.modes"
              :key="mode"
              :class="['pill', { active: activeMode === mode }]"
              :style="pillStyle"
              :to="{ name: 'GameLandingMode', params: { gameId: game.id, modeId: mode } }"
          >
            {{ mode }}
          </RouterLink>
        </nav>

        <section class="card landing-card" v-if="game">
          <header class="landing-card-header">
            <div>
              <h2>{{ activeMode ? `${game.name} – ${activeMode}` : `${game.name} leaderboard` }}</h2>
              <small>
                Showing top {{ scores.length ? scores.length : 0 }} scores
                <span v-if="activeMode">for {{ activeMode }}</span>
              </small>
            </div>
          </header>
          <ScoreTable :items="scores" title="" showMode />
        </section>

        <section v-else class="card landing-card">
          <h2>Game not found</h2>
          <p>Check the URL or return to the <RouterLink to="/scores">high scores</RouterLink>.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { RouterLink } from 'vue-router';
import ScoreTable from '../components/ScoreTable.vue';
import { useArcadeStore } from '../stores/arcadeStore';

const route = useRoute();
const { state } = useArcadeStore();

const game = computed(() => state.games.find((item) => item.id === route.params.gameId));
const activeMode = computed(() => route.params.modeId && route.params.modeId.toString());

const accentColor = computed(() => game.value?.theme?.accentColor || 'var(--accent)');
const textColor = computed(() => game.value?.theme?.textColor || '#f8fafc');

const scores = computed(() => {
  const subset = state.submissions
    .filter((entry) => entry.gameId === route.params.gameId && (!activeMode.value || entry.mode === activeMode.value))
    .map((entry) => ({
      ...entry,
      locationName: state.locations.find((loc) => loc.id === entry.locationId)?.name || entry.locationId,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);
  return subset;
});

const topScore = computed(() => scores.value[0]);

const pageStyle = computed(() => ({
  '--landing-accent': accentColor.value,
  '--landing-text': textColor.value,
  backgroundImage: game.value?.theme?.backgroundImage
    ? `linear-gradient(180deg, rgba(2,6,23,0.65), rgba(2,6,23,0.9)), url(${game.value.theme.backgroundImage})`
    : undefined,
}));

const ctaStyle = computed(() => ({
  borderColor: accentColor.value,
  color: accentColor.value,
}));

const pillStyle = computed(() => ({
  borderColor: accentColor.value,
  color: accentColor.value,
}));
</script>

<style scoped>
.landing-shell {
  min-height: 100vh;
  width: 100%;
  background: #020617;
  background-size: cover;
  background-position: center;
  color: var(--landing-text, #f8fafc);
}

.landing-overlay {
  backdrop-filter: blur(6px);
  min-height: 100vh;
}

.landing-container {
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 1.25rem 4rem;
  flex-direction: column;
  display: flex;
  gap: 1.5rem;
}

.back-link {
  color: var(--landing-text, #f8fafc);
  opacity: 0.8;
}

.landing-hero {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mode-label span {
  color: var(--landing-accent, var(--accent));
  font-weight: 600;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: rgba(248, 250, 252, 0.8);
}

.mode-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pill {
  border: 1px solid var(--landing-accent, var(--accent));
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
}

.pill.active {
  background: var(--landing-accent, var(--accent));
  color: #041525;
}

.landing-card {
  background: rgba(15, 23, 42, 0.9);
}

.landing-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (min-width: 720px) {
  .landing-card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.card-actions .cta {
  border: 1px solid var(--landing-accent, var(--accent));
  color: var(--landing-accent, var(--accent));
}
</style>
