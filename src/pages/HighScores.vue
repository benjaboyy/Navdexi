<template>
  <div class="page">
    <h1>High Scores</h1>
    <p class="subtitle">Live leaderboard per game. Data currently mocked from local JSON.</p>

    <div class="grid">
      <ScoreTable
        v-for="game in highscores"
        :key="game.id"
        :title="game.name"
        :items="decorate(game.scores)"
      />
    </div>
  </div>
</template>

<script setup>
import ScoreTable from '../components/ScoreTable.vue';
import { useArcadeStore } from '../stores/arcadeStore';

const { highscoresByGame, state } = useArcadeStore();
const highscores = highscoresByGame;

const decorate = (scores) =>
  scores.map((score) => ({
    ...score,
    locationName: state.locations.find((loc) => loc.id === score.locationId)?.name,
  }));
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}
</style>

