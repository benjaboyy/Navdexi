const rawUrl = import.meta.env.VITE_FIREBASE_URL;
const baseUrl = rawUrl?.replace(/\/?$/, '') || null;

export const firebaseConfigured = Boolean(baseUrl);

const ensureConfigured = () => {
  if (!firebaseConfigured) {
    throw new Error('Firebase URL missing. Set VITE_FIREBASE_URL in your .env');
  }
};

const toUrl = (path) => `${baseUrl}/${path}.json`;

const request = async (path, options = {}) => {
  ensureConfigured();
  const response = await fetch(toUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Firebase request failed (${response.status}): ${message}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const toArray = (snapshot) =>
  snapshot
    ? Object.entries(snapshot).map(([id, value]) => ({ id, ...(value || {}) }))
    : [];

export const fetchCollection = async (resource) => {
  const data = await request(resource);
  return toArray(data);
};

export const putRecord = async (resource, record) => {
  if (!record?.id) throw new Error(`Cannot persist ${resource}: missing id`);
  await request(`${resource}/${record.id}`, {
    method: 'PUT',
    body: JSON.stringify(record),
  });
  return record;
};

export const deleteRecord = async (resource, id) => {
  if (!id) return;
  await request(`${resource}/${id}`, { method: 'DELETE' });
};
