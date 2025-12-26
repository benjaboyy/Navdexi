import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { config as runtimeConfig } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

initializeApp();

const apiPasswordSecret = defineSecret('SCORES_API_PASSWORD');

const resolvePassword = () => {
  const secretValue = apiPasswordSecret.value();
  if (secretValue) return secretValue;
  try {
    const cfg = runtimeConfig();
    if (cfg?.scores?.password) return cfg.scores.password;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('scores.password runtime config not set; falling back to env vars.');
    }
  }
  return process.env.SCORES_API_PASSWORD || process.env.VITE_API_PASSWORD || '';
};

const requirePassword = (expected, provided) => {
  if (!expected) {
    throw new Error('API password not configured.');
  }
  if (!provided) {
    const error = new Error('Missing API password.');
    error.code = 'missing-password';
    throw error;
  }
  if (provided !== expected) {
    const error = new Error('Invalid API password.');
    error.code = 'invalid-password';
    throw error;
  }
};

const requiredFields = ['gamertag', 'score', 'gameId', 'locationId'];

const validatePayload = (payload = {}) => {
  const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === '');
  if (missing.length) {
    throw new Error(`Missing fields: ${missing.join(', ')}`);
  }
};

const normalizeGamertag = (value) => String(value).trim();
const makeUniqueKey = ({ gamertag, gameId, locationId }) =>
  `${gameId}::${locationId}::${normalizeGamertag(gamertag).toLowerCase()}`;

const sanitizeSubmission = (payload) => ({
  id: `api-${Date.now()}`,
  timestamp: new Date().toISOString(),
  gamertag: normalizeGamertag(payload.gamertag),
  score: Number(payload.score) || 0,
  gameId: payload.gameId,
  locationId: payload.locationId,
  mode: payload.mode || null,
  uniqueKey: makeUniqueKey(payload),
});

const enforceHighScore = async (db, submission) => {
  const bestRef = db.ref(`submissionsByKey/${submission.uniqueKey}`);
  const snapshot = await bestRef.get();
  const existing = snapshot.exists() ? snapshot.val() : null;
  if (existing && Number(existing.score) >= submission.score) {
    const error = new Error('A higher score already exists for this player at this location.');
    error.code = 'score-too-low';
    throw error;
  }
  if (existing?.submissionId) {
    await db.ref(`submissions/${existing.submissionId}`).remove();
  }
  await bestRef.set({ submissionId: submission.id, score: submission.score });
};

export const apiScores = onRequest({ cors: true, secrets: [apiPasswordSecret] }, async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const payload = req.body ?? {};
    const { password, ...submissionPayload } = payload;
    const expectedPassword = resolvePassword();
    requirePassword(expectedPassword, password);
    validatePayload(submissionPayload);
    const submission = sanitizeSubmission(submissionPayload);

    const db = getDatabase();
    await enforceHighScore(db, submission);
    await db.ref(`submissions/${submission.id}`).set(submission);

    res.status(201).json({ success: true, submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = error?.code && ['missing-password', 'invalid-password', 'score-too-low'].includes(error.code)
      ? (error.code === 'score-too-low' ? 409 : 401)
      : 400;
    res.status(status).json({ success: false, error: message });
  }
});
