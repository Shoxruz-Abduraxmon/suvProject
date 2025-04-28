// const { Telegraf } = require("telegraf");
// const sessionMiddleware = require("./sessionBot");

// const {
//   start,
//   handleText,
//   handleLocation,
//   handlePaymentMethod,
//   handlePaymentAmount,
//   handlePartialAmount,
//   handleChequeImage,
//   declineOrder,
//   confirmOrder
// } = require("./controllers/botClientController");

// // const { confirmOrder } = require("./controllers/botZakazController");

// require("dotenv").config();

// const bot = new Telegraf(process.env.BOT_TOKEN);

// // Session Middleware
// bot.use(sessionMiddleware);

// // Debug: log session
// bot.use((ctx, next) => {
//   console.log("Session:", ctx.session);
//   return next();
// });

// // Main handlers
// bot.command("start", start);
// bot.action("confirm_order", confirmOrder);

// if (ctx.session?.step === "ask_partial_amount") {
//   return handlePartialAmount(ctx); // ✅ Now this works
// }


// bot.on("location", handleLocation);

// // Payment step handling
// bot.action(["payment_cash", "payment_card"], handlePaymentMethod);
// bot.action(["full_payment", "partial_payment"], handlePaymentAmount);

// // Photo (cheque image) handling
// bot.on("photo", async (ctx) => {
//   if (ctx.session?.step === "upload_cheque") {
//     return handleChequeImage(ctx);
//   }
// });

// // Decline order (you can later bind this to a button like "decline_order")
// bot.action("decline_order", declineOrder);

// module.exports = bot;

const { Telegraf, session } = require("telegraf");
const mongoose = require('mongoose');
const bot = new Telegraf(process.env.BOT_TOKEN);

// Import controller
const botClientController = require("./controllers/botClientController");


bot.use(session());

// Start command
bot.command("start", (ctx) => botClientController.start(ctx));

// Handle location
bot.on("location", (ctx) => botClientController.handleLocation(ctx));

// Handle cheque image
bot.on("photo", (ctx) => botClientController.handleChequeImage(ctx));

// Handle all text messages
bot.on("text", async (ctx) => {
    await botClientController.handleText(ctx);
});

// Handle callback queries (button clicks)
bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data === "confirm_order") return botClientController.confirmOrder(ctx);
    if (data === "decline_order") return botClientController.declineOrder(ctx);
    if (data === "payment_cash" || data === "payment_card") return botClientController.handlePaymentMethod(ctx);
    if (data === "full_payment" || data === "partial_payment") return botClientController.handlePaymentAmount(ctx);
});

module.exports = bot;
