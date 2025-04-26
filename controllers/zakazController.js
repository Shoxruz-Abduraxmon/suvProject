const Zakaz = require('../models/zakaz');
const Client = require('../models/Client');
const { Telegraf } = require("telegraf");
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); 

const bot = new TelegramBot(process.env.BOT_TOKEN2, { polling: true });
const activeOrders = {}; // session memory

exports.postBuyurtma = async (req, res) => {
  const { telefon, ism, miqdor, lokatsiya, kuryer } = req.body;

  try {
    let client = await Client.findOne({ telefon });

    if (!client) {
      if (!ism || !lokatsiya) {
        return res.status(400).send('Ism va lokatsiya kiritilishi shart!');
      }
      client = new Client({ telefon, ism, lokatsiya });
      await client.save();
    }

    const newZakaz = new Zakaz({
      telefon,
      ism: ism || client.ism,
      miqdor,
      lokatsiya: lokatsiya || client.lokatsiya,
      kuryer
    });
    await newZakaz.save();

    const messageText = `
📦 *Yangi Buyurtma!*
👤 Ism: ${newZakaz.ism}
📱 Telefon: ${newZakaz.telefon}
📍 Lokatsiya: ${newZakaz.lokatsiya}
💧 Miqdor: ${newZakaz.miqdor}
🚚 Kuryer: ${newZakaz.kuryer}
🕒 Sana: ${new Date(newZakaz.createdAt).toLocaleString()}
    `;

    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, messageText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Qabul qilish", callback_data: `accept_${newZakaz._id}` },
            { text: "❌ Rad etish", callback_data: `reject_${newZakaz._id}` }
          ]
        ]
      }
    });

    console.log('Yangi buyurtma:', newZakaz);
    res.redirect('/buyurtma');
  } catch (e) {
    console.error('Buyurtmani saqlashda xatolik:', e);
    res.status(500).send('Xatolik yuz berdi');
  }
};

// CALLBACK HANDLER
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const dataParts = query.data.split('_');
  const action = dataParts[0];
  const prefix = dataParts[1] || null;
  const type = dataParts[2] || null;
  const zakazId = dataParts[dataParts.length - 1];

  if (action === 'accept') {
    await Zakaz.findByIdAndUpdate(zakazId, { zakazstatusi: 'accepted' });
    bot.sendMessage(chatId, "✅ Buyurtma qabul qilindi.");

    setTimeout(async () => {
      await Zakaz.findByIdAndUpdate(zakazId, { zakazstatusi: 'in progress' });
      bot.sendMessage(chatId, "🚚 Buyurtma yo'lda! (in progress)");
      bot.sendMessage(chatId, "Yetkazildimi?", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📦 Yetkazildi", callback_data: `delivered_${zakazId}` }]
          ]
        }
      });
    }, 1000); // you can set 5 mins here (e.g. 5 * 60 * 1000)
  }

  else if (action === 'reject') {
    bot.sendMessage(chatId, "❌ Buyurtma bekor qilindi.");
  }

  else if (action === 'delivered') {
    await Zakaz.findByIdAndUpdate(zakazId, { zakazstatusi: 'delivered' });

    bot.sendMessage(chatId, "📍 Lokatsiyani yuboring:", {
      reply_markup: {
        keyboard: [[{ text: "📍 Lokatsiyani yuborish", request_location: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    activeOrders[chatId] = {
      zakazId,
      step: 'waiting_for_location'
    };
  }

  else if (prefix === 'payment') {
    await Zakaz.findByIdAndUpdate(zakazId, { payment: type });

    activeOrders[chatId] = {
      zakazId,
      step: 'waiting_for_payment_percentage',
      paymentMethod: type
    };

    bot.sendMessage(chatId, `💰 To'lov turi: ${type === 'cash' ? 'Naqd' : 'Plastik karta'} tanlandi. To'lov miqdorini tanlang:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "100%", callback_data: `payfull_${zakazId}` }],
          [{ text: "Qisman", callback_data: `paypartial_${zakazId}` }]
        ]
      }
    });
  }

  else if (prefix === 'payfull') {
    activeOrders[chatId].step = 'waiting_for_receipt';
    bot.sendMessage(chatId, "📸 Endi to‘lov chekini rasm sifatida yuboring.");
  }

  else if (prefix === 'paypartial') {
    activeOrders[chatId].step = 'waiting_for_partial_amount';
    bot.sendMessage(chatId, "💵 Mijoz qancha to‘lov qildi? Summani yuboring:");
  }
});

// MESSAGE HANDLER
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const user = activeOrders[chatId];

  if (!user) return;

  if (user.step === 'waiting_for_location' && msg.location) {
    await Zakaz.findByIdAndUpdate(user.zakazId, {
      lokatsiya: `${msg.location.latitude},${msg.location.longitude}`
    });

    bot.sendMessage(chatId, "💳 To'lov turini tanlang:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💵 Naqd", callback_data: `payment_cash_${user.zakazId}` }],
          [{ text: "💳 Plastik karta", callback_data: `payment_card_${user.zakazId}` }]
        ]
      }
    });

    user.step = 'waiting_for_payment_type';
  }

  else if (user.step === 'waiting_for_partial_amount') {
    const amount = parseFloat(msg.text);
    if (isNaN(amount)) {
      return bot.sendMessage(chatId, "❌ Noto‘g‘ri summa. Iltimos, raqam kiriting.");
    }

    await Zakaz.findByIdAndUpdate(user.zakazId, { qismanTolov: amount });
    user.step = 'waiting_for_receipt';
    bot.sendMessage(chatId, "✅ Qisman to'lov qabul qilindi. Endi to‘lov chekini yuboring.");
  }
});

// PHOTO (RECEIPT) HANDLER
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const user = activeOrders[chatId];
  if (!user || user.step !== 'waiting_for_receipt') return;

  const fileId = msg.photo[msg.photo.length - 1].file_id;

  await Zakaz.findByIdAndUpdate(user.zakazId, {
    rasm: fileId,
    zakazstatusi: 'closed'
  });

  bot.sendMessage(chatId, "✅ Buyurtma yopildi. Rasm saqlandi.");
  delete activeOrders[chatId]; // clear session
});

// const Zakaz = require('../models/zakaz');
// const Client = require('../models/Client');
// const axios = require('axios');
// const { Telegraf, session } = require("telegraf");
// require('dotenv').config(); 
// const TelegramBot = require('node-telegram-bot-api');
// const bot = new TelegramBot(process.env.BOT_TOKEN2, { polling: true });
exports.getHome = async (req, res) => {
    try {
        const zakazIstor = await Zakaz.find().lean();
        const totalMiqdor = zakazIstor.reduce((sum, zakaz) => sum + (Number(zakaz.miqdor) || 0), 0);

        res.render('home', {
            title: 'Home',
            zakazIstor,
            totalMiqdor
        });
    } catch (e) {
        console.error(e + 'contrellers zakazda muammoooo');
    }
};


exports.getTeldanTopish = async(req, res) => {
    const { telefon } = req.query;
    
        if (!telefon) {
            return res.status(400).json({ error: 'Telefon raqami kiritilmagan' });
        }
    
        try {
            let client = await Client.findOne({ telefon }).lean();
            
            if (!client) {
                const oldZakaz = await Zakaz.findOne({ telefon }).sort({ createdAt: -1 }).lean();
                if (oldZakaz) {
                    client = { telefon, ism: oldZakaz.ism, lokatsiya: oldZakaz.lokatsiya };
                }
            }
    
            if (!client) {
                return res.json({ order: null }); 
            }
    
            res.json({ order: client });
        } catch (e) {
            console.error('Xatolik:', e);
            res.status(500).json({ error: 'Server xatosi' });
        }
}

// exports.postBuyurtma = async (req, res) => {
//     const { telefon, ism, miqdor, lokatsiya, kuryer } = req.body;

//     try {
//         let client = await Client.findOne({ telefon });

//         if (!client) {
//             if (!ism || !lokatsiya) {
//                 return res.status(400).send('Ism va lokatsiya kiritilishi shart!');
//             }
//             client = new Client({ telefon, ism, lokatsiya });
//             await client.save();
//         }

//         const newZakaz = new Zakaz({ 
//             telefon, 
//             ism: ism || client.ism, 
//             miqdor, 
//             lokatsiya: lokatsiya || client.lokatsiya, 
//             kuryer 
//         });
//         await newZakaz.save();
//         const messageText = `
//         📦 *Yangi Buyurtma!*
//         👤 Ism: ${newZakaz.ism}
//         📱 Telefon: ${newZakaz.telefon}
//         📍 Lokatsiya: ${newZakaz.lokatsiya}
//         💧 Miqdor: ${newZakaz.miqdor}
//         🚚 Kuryer: ${newZakaz.kuryer}
//         🕒 Sana: ${new Date(newZakaz.createdAt).toLocaleString()}
//         `;

// // await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN2}/sendMessage`, {
// //     chat_id: process.env.TELEGRAM_CHAT_ID,
// //     text: messageText,
// //     parse_mode: 'Markdown'
// // });
// await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, messageText, {
//   parse_mode: 'Markdown',
//   reply_markup: {
//     inline_keyboard: [
//       [
//         { text: "✅ Qabul qilish", callback_data: `accept_${newZakaz._id}` },
//         { text: "❌ Rad etish", callback_data: `reject_${newZakaz._id}` }
//       ]
//     ]
//   }
// });
// // const Zakaz = require('./models/zakaz');

// // Accept or reject
// bot.on('callback_query', async (query) => {
//   const chatId = query.message.chat.id;
//   // const [action, zakazId, prefix, type, zakazId] = query.data.split('_');
//   const dataParts = query.data.split('_');
// const action = dataParts[0];
// const zakazId = dataParts[dataParts.length - 1]; // always last
// const prefix = dataParts[1] || null;
// const type = dataParts[2] || null;

//   if (action === 'accept') {
//     await Zakaz.findByIdAndUpdate(zakazId, { zakazstatusi: 'accepted' });

//     bot.sendMessage(chatId, "✅ Buyurtma qabul qilindi.");

//     // Update to "in progress" after 5 minutes
//     setTimeout(async () => {
//       await Zakaz.findByIdAndUpdate(zakazId, { zakazstatusi: 'in progress' });
//       bot.sendMessage(chatId, "🚚 Buyurtma yo'lda! (in progress)");
      
//       bot.sendMessage(chatId, "Yetkazildimi?", {
//         reply_markup: {
//           inline_keyboard: [
//             [{ text: "📦 Yetkazildi", callback_data: `delivered_${zakazId}` }]
//           ]
//         }
//       });
//     }); // 5 minutes
//   }

//   else if (action === 'reject') {
//     bot.sendMessage(chatId, "❌ Buyurtma bekor qilindi.");
//   }

//   else if (action === 'delivered') {
//     await Zakaz.findByIdAndUpdate(zakazId, { zakazstatusi: 'delivered' });

//     bot.sendMessage(chatId, "📍 Lokatsiyani yuboring:", {
//       reply_markup: {
//         keyboard: [[{ text: "📍 Lokatsiyani yuborish", request_location: true }]],
//         resize_keyboard: true,
//         one_time_keyboard: true
//       }
//     });

//     // Store this user's current zakaz id in memory (optional: use DB for multiple users)
//     activeOrders[chatId] = { zakazId, step: 'waiting_for_location' };
//     if (prefix === 'payment') {
//     // Naqd yoki karta tanlandi
//     await Zakaz.findByIdAndUpdate(zakazId, { payment: type });

//     activeOrders[chatId] = {
//       zakazId,
//       step: 'waiting_for_payment_percentage',
//       paymentMethod: type
//     };

//     bot.sendMessage(chatId, `💰 To'lov turi: ${type === 'cash' ? 'Naqd' : 'Plastik karta'} tanlandi. To'lov miqdorini tanlang:`, {
//       reply_markup: {
//         inline_keyboard: [
//           [{ text: "100%", callback_data: `payfull_${zakazId}` }],
//           [{ text: "Qisman", callback_data: `paypartial_${zakazId}` }]
//         ]
//       }
//     });
//   }

//   else if (prefix === 'payfull') {
//     activeOrders[chatId].step = 'waiting_for_receipt';
//     bot.sendMessage(chatId, `📸 Endi to‘lov chekini rasm sifatida yuboring.`);
//   }

//   else if (prefix === 'paypartial') {
//     activeOrders[chatId].step = 'waiting_for_partial_amount';
//     bot.sendMessage(chatId, "💵 Mijoz qancha to‘lov qildi? Summani yuboring:");
//   }
//   }
// });
// const activeOrders = {}; // userId => { zakazId, step, ... }

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const user = activeOrders[chatId];

//   if (!user) return;

//   if (user.step === 'waiting_for_location' && msg.location) {
//     await Zakaz.findByIdAndUpdate(user.zakazId, {
//       lokatsiya: `${msg.location.latitude},${msg.location.longitude}`
//     });

//  bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const user = activeOrders[chatId];

//   if (!user) return;

//   if (user.step === 'waiting_for_location' && msg.location) {
//     await Zakaz.findByIdAndUpdate(user.zakazId, {
//       lokatsiya: `${msg.location.latitude},${msg.location.longitude}`
//     });

//     bot.sendMessage(chatId, "💳 To'lov turini tanlang:", {
//       reply_markup: {
//         inline_keyboard: [
//           [{ text: "💵 Naqd", callback_data: `payment_cash_${user.zakazId}` }],
//           [{ text: "💳 Plastik karta", callback_data: `payment_card_${user.zakazId}` }]
//         ]
//       }
//     });

//     user.step = 'waiting_for_payment_type';
//   }

//   else if (user.step === 'waiting_for_partial_amount') {
//     const amount = parseFloat(msg.text);
//     if (isNaN(amount)) {
//       return bot.sendMessage(chatId, "❌ Noto‘g‘ri summa. Iltimos, raqam kiriting.");
//     }

//     await Zakaz.findByIdAndUpdate(user.zakazId, { qismanTolov: amount });
//     user.step = 'waiting_for_receipt';

//     bot.sendMessage(chatId, "✅ Qisman to'lov qabul qilindi. Endi to‘lov chekini yuboring.");
//   }
// });

//   }
// });
// bot.on('photo', async (msg) => {
//   const chatId = msg.chat.id;
//   const fileId = msg.photo[msg.photo.length - 1].file_id;

//   const user = activeOrders[chatId];
//   if (!user) return;

//   await Zakaz.findByIdAndUpdate(user.zakazId, {
//     rasm: fileId,
//     zakazstatusi: 'closed'
//   });

//   bot.sendMessage(chatId, "✅ Buyurtma yopildi. Rasm saqlandi.");
//   delete activeOrders[chatId]; // clear session
// });

//         console.log('Yangi buyurtma:', newZakaz);
//         res.redirect('/home');
//     } catch (e) {
//         console.error('Buyurtmani saqlashda xatolik:', e);
//         res.status(500).send('Xatolik yuz berdi');
//     }
    
// };




