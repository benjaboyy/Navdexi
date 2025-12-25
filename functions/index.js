import { onRequest } from 'firebase-functions/v2/https';
import { config as runtimeConfig } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

initializeApp();

const resolvePassword = () => {
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

const sanitizeSubmission = (payload) => ({
  id: `api-${Date.now()}`,
  timestamp: new Date().toISOString(),
  gamertag: String(payload.gamertag).trim(),
  score: Number(payload.score) || 0,
  gameId: payload.gameId,
  locationId: payload.locationId,
  mode: payload.mode || null,
});

export const apiScores = onRequest({ cors: true }, async (req, res) => {
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
    await db.ref(`submissions/${submission.id}`).set(submission);

    res.status(201).json({ success: true, submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = error?.code && ['missing-password', 'invalid-password'].includes(error.code)
      ? 401
      : 400;
    res.status(status).json({ success: false, error: message });
  }
});
