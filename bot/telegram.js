const { Telegraf } = require("telegraf");
const sessionMiddleware = require("./sessionBot");
const { start, handleText } = require("./controllers/botClientController");
const { confirmOrder } = require("./controllers/botZakazController");

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(sessionMiddleware);

bot.command("start", start);
bot.on("text", handleText);
bot.command("confirm", confirmOrder);

module.exports = bot;
