<template>
  <div class="page">
    <h1>High Scores</h1>
    <p class="subtitle">Live leaderboard per game sourced from Firebase.</p>

    <div class="grid">
      <div v-for="game in highscores" :key="game.id" class="game-card">
        <header class="game-header">
          <h2>{{ game.name }}</h2>
          <small>ID: {{ game.id }}</small>
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
          />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
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
</script>
