
const LocalSession = require("telegraf-session-local");

const sessionMiddleware = new LocalSession({
  database: "sessions.json", // You can specify a different file to store session data
}).middleware();

module.exports = sessionMiddleware;
