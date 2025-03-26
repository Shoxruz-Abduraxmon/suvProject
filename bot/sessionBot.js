const LocalSession = require("telegraf-session-local");

const sessionMiddleware = new LocalSession({ database: "session_db.json" }).middleware();

module.exports = sessionMiddleware;
