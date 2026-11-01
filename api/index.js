let connectionPromise = null;
let appHandler = null;

function loadApp() {
  if (!appHandler) {
    const appMod = require('../backend/dist/app.js');
    const app = appMod.default ?? appMod;
    appHandler = app;
  }
  return appHandler;
}

function connectOnce() {
  if (!connectionPromise) {
    const dbMod = require('../backend/dist/config/db.js');
    const connectDB = dbMod.connectDB ?? dbMod.default;
    connectionPromise = connectDB();
    connectionPromise.failOnce = false;
    connectionPromise.catch(() => {
      connectionPromise = null;
    });
  }
  return connectionPromise;
}

module.exports = async function handler(req, res) {
  try {
    await connectOnce();
  } catch (error) {
    console.error('MongoDB unavailable:', error);
    res.status(503).json({
      success: false,
      error: { code: 'DB_UNAVAILABLE', message: 'Database connection failed' },
    });
    return;
  }
  const app = loadApp();
  return app(req, res);
};
