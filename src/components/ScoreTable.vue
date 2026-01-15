<template>
  <div class="score-table">
    <header>
      <h3 v-if="title">{{ title }}</h3>
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
