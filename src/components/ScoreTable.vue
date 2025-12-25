<template>
  <div class="score-table">
    <header>
      <h3>{{ title }}</h3>
      <slot name="actions" />
    </header>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Gamertag</th>
          <th>Score</th>
          <th v-if="showMode">Mode</th>
          <th>Location</th>
<!--          <th>When</th>-->
          <th v-if="$slots.rowActions"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in items" :key="entry.id">
          <td>{{ index + 1 }}</td>
          <td>{{ entry.gamertag }}</td>
          <td>{{ entry.score.toLocaleString() }}</td>
          <td v-if="showMode">{{ entry.mode || '—' }}</td>
          <td>{{ entry.locationName || entry.locationId }}</td>
<!--          <td>{{ formatDate(entry.timestamp) }}</td>-->
          <td v-if="$slots.rowActions">
            <slot name="rowActions" :entry="entry" />
          </td>
        </tr>
        <tr v-if="!items.length">
          <td :colspan="showMode ? 6 : 5" class="empty">No scores yet.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, default: () => [] },
  showMode: { type: Boolean, default: false },
});

const formatDate = (value) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';
</script>

<style scoped>
.score-table {
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 1rem;
  background: #fff;
  color: #111;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

h3 {
  margin: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.35rem;
  border-bottom: 1px solid #f4f4f5;
}

thead th {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}

tbody tr:last-child td {
  border-bottom: none;
}

.empty {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}
</style>

