import { createRouter, createWebHistory } from 'vue-router';

const HighScores = () => import('../pages/HighScores.vue');
const AdminPanel = () => import('../pages/AdminPanel.vue');
const SubmitScore = () => import('../pages/SubmitScore.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/scores' },
    { path: '/scores', name: 'HighScores', component: HighScores },
    { path: '/submit', name: 'SubmitScore', component: SubmitScore },
    { path: '/admin', name: 'AdminPanel', component: AdminPanel },
    { path: '/:pathMatch(.*)*', redirect: '/scores' },
  ],
});

export default router;
