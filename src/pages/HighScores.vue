<template>
  <div class="page">
    <h1>High Scores</h1>
    <p class="subtitle">Live leaderboard per game sourced from Firebase.</p>

    <div class="grid">
      <div
        v-for="game in highscores"
        :key="game.id"
        class="game-card"
        :style="cardStyle(game)"
      >
        <header class="game-header">
          <div>
            <h2>{{ game.name }}</h2>
            <small>ID: {{ game.id }}</small>
          </div>
          <RouterLink class="cta" :style="ctaStyle(game)" :to="{ name: 'GameLanding', params: { gameId: game.id } }">
            View page
          </RouterLink>
        </header>

        <ScoreTable
          v-if="!game.modes?.length"
          :title="game.modes?.length ? 'Overall' : 'Top scores'"
          :items="decorate(game.scores)"
        />

        <section v-if="game.modes?.length" class="mode-stack">
          <ScoreTable
            v-for="mode in game.modes"
            :key="`${game.id}-${mode}`"
            :title="mode"
            :items="getModeScores(game.id, mode)"
          >
            <template #actions>
              <RouterLink
                class="mode-link"
                :style="ctaStyle(game)"
                :to="{ name: 'GameLandingMode', params: { gameId: game.id, modeId: mode } }"
              >
                Open landing
              </RouterLink>
            </template>
          </ScoreTable>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import ScoreTable from '../components/ScoreTable.vue';
import { useArcadeStore } from '../stores/arcadeStore';

const { highscoresByGame, state } = useArcadeStore();
const highscores = highscoresByGame;

const decorate = (scores = []) =>
  scores.map((score) => ({
    ...score,
    locationName: state.locations.find((loc) => loc.id === score.locationId)?.name,
  }));

const getModeScores = (gameId, mode) =>
  decorate(
    state.submissions
      .filter((entry) => entry.gameId === gameId && entry.mode === mode)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10),
  );

const cardStyle = (game) => ({
  borderColor: game.theme?.accentColor || 'var(--border)',
  backgroundImage: game.theme?.backgroundImage
    ? `linear-gradient(180deg, rgba(2,6,23,0.8), rgba(2,6,23,0.95)), url(${game.theme.backgroundImage})`
    : undefined,
  backgroundSize: game.theme?.backgroundImage ? 'cover' : undefined,
  backgroundPosition: 'center',
});

const ctaStyle = (game) => ({
  borderColor: game.theme?.accentColor || 'var(--accent)',
  color: game.theme?.accentColor || 'var(--accent)',
});
</script>
