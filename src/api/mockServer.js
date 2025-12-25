import seed from '../data/seed.json' assert { type: 'json' };

const clone = (items) => items.map((item) => ({ ...item }));

function mockServer() {
  const db = {
    games: clone(seed.games),
    locations: clone(seed.locations),
    submissions: clone(seed.submissions),
  };

  const sendJson = (res, status, payload) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  };

  const parseBody = (req) => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

  return {
    name: 'mock-score-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/scores')) {
          next();
          return;
        }

        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          sendJson(res, 405, { success: false, error: 'Method not allowed' });
          return;
        }

        try {
          const payload = await parseBody(req);
          const required = ['score', 'gameId', 'locationId', 'gamertag'];
          const missing = required.filter((field) => !payload[field] && payload[field] !== 0);
          if (missing.length) {
            sendJson(res, 400, { success: false, error: `Missing fields: ${missing.join(', ')}` });
            return;
          }

          const submission = {
            id: `api-${Date.now()}`,
            timestamp: new Date().toISOString(),
            mode: payload.mode || null,
            score: Number(payload.score) || 0,
            gamertag: payload.gamertag,
            gameId: payload.gameId,
            locationId: payload.locationId,
          };

          db.submissions.unshift(submission);
          sendJson(res, 201, { success: true, submission });
        } catch (error) {
          sendJson(res, 400, { success: false, error: 'Invalid JSON body' });
        }
      });
    },
  };
}

export default mockServer;
