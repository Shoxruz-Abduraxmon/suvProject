// const { Markup } = require("telegraf");
// const Client = require("../../models/Client");
// const Order = require("../../models/zakaz");
// const Archive = require("../../models/Archive");

// exports.start = async (ctx) => {
//     try {
//         const user = ctx.from;
//         const userName = user.first_name;
//         const userPhone = user.phone_number || "Telefon raqam mavjud emas"; // You can adjust this based on availability
        
//         ctx.session = { step: "phone" };

//         // Greet the user with their name and phone number
//         ctx.reply(
//             `Salom, ${userName}! Sizning telefon raqamingiz: ${userPhone}`,
//             Markup.keyboard([
//                 [{ text: "Yangi Zakaz" }, { text: "Ishni Yakunlash" }]
//             ])
//             .resize()
//             .oneTime()
//         );
//     } catch (e) {
//         console.error("❌ Muammo bor - BotControllerda:", e);
//         ctx.reply("❌ Ichki xatolik yuz berdi, keyinroq urinib ko‘ring.");
//     }
// };

// exports.handleText = async (ctx) => {
//     try {
//         if (!ctx.session) ctx.session = {};

//         const step = ctx.session.step;
//         const text = ctx.message.text;

//         // Check if the user pressed 'Yangi Zakaz' or 'Ishni Yakunlash'
//         if (text === "Yangi Zakaz") {
//             ctx.session.step = "phone";
//             return ctx.reply("Ishni boshladik. Mijozning telefon raqamini kiriting (+ bilan boshlansin):");
//         }

//         if (text === "Ishni Yakunlash") {
//             return ctx.reply("Ish yakunlandi. Yaxshi kunlar!");
//         }

//         if (step === "phone") {
//             const phoneNumber = text.trim();
//             if (!phoneNumber.startsWith("+") || phoneNumber.length < 10 || isNaN(phoneNumber.slice(1))) {
//                 return ctx.reply("⚠️ Raqamni xatolik bilan yozdingiz! + bilan boshlab kiriting.");
//             }

//             ctx.session.phone = phoneNumber;
//             ctx.session.step = "check_client";

//             const existingClient = await Client.findOne({ telefon: phoneNumber });

//             if (existingClient) {
//                 ctx.session.fullName = existingClient.ism;
//                 ctx.session.clientId = existingClient._id;
//                 ctx.session.step = "quantity";  // Skip full name and go straight to quantity.

//                 return ctx.reply(
//                     `✅ Mijoz topildi!\n👤 Ismi: ${existingClient.ism}\n📞 Telefon: ${existingClient.telefon}\n\n💧 Qancha suv kerak?`,
//                     Markup.removeKeyboard()
//                 );
//             }

//             // If the client is not found, move to "fullName" step
//             ctx.session.step = "fullName";
//             return ctx.reply("🔹 Yangi mijoz! To'liq ismini kiriting:");
//         }

//         if (step === "fullName") {
//             ctx.session.fullName = text;
//             ctx.session.step = "location";
//             return ctx.reply(
//                 "📍 Iltimos, Mijoz lokatsiyasini yuboring.",
//                 Markup.keyboard([ [{ text: "📍 Mijoz lokatsiyasini yuboring", request_location: true } ]]).resize()
//             );
//         }

//         if (step === "quantity") {
//             const quantity = parseInt(text, 10);
//             if (isNaN(quantity) || quantity <= 0) {
//                 return ctx.reply("⚠️ Boklajka miqdorini raqam bilan kiriting.");
//             }

//             ctx.session.waterQuantity = quantity;
//             ctx.session.cost = quantity * 5000; // example price
//             ctx.session.step = "confirmation";

//             return ctx.reply(
//                 `📝 Zakaz:\n👤 Ismi: ${ctx.session.fullName}\n📞 Tel: ${ctx.session.phone}\n📍 Lokatsiya: ${ctx.session.location.latitude}, ${ctx.session.location.longitude}\n💧 Miqdor: ${quantity}\n💰 Narxi: ${ctx.session.cost} so'm`,
//                 Markup.inlineKeyboard([
//                     [Markup.button.callback("✅ Tasdiqlash", "confirm_order")],
//                     [Markup.button.callback("❌ Bekor qilish", "decline_order")]
//                 ])
//             );
//         }

//         if (step === "ask_partial_amount") {
//             const amount = parseInt(text, 10);
//             if (isNaN(amount) || amount <= 0) {
//                 return ctx.reply("⚠️ To‘lov miqdorini to‘g‘ri kiriting.");
//             }
//             ctx.session.tulovholati = `Qisman (${amount} so'm)`;
//             ctx.session.partialAmount = amount;
//             ctx.session.step = "upload_cheque";
//             return ctx.reply("📸 Iltimos, chek rasmni yuboring.");
//         }
//     } catch (error) {
//         console.error("❌ Xatolik:", error);
//         ctx.reply("❌ Ichki xatolik yuz berdi, keyinroq urinib ko‘ring.");
//     }
// };

// exports.handleLocation = async (ctx) => {
//     try {
//         if (!ctx.message.location) return ctx.reply("❌ Lokatsiya yuborilmadi. Qayta urinib ko‘ring.");

//         ctx.session.location = ctx.message.location;
//         ctx.session.step = "quantity";

//         return ctx.reply("💧 Qancha baklajka suv xohlayapti?", Markup.removeKeyboard());
//     } catch (e) {
//         console.error("❌ Lokatsiya xatoligi:", e);
//         ctx.reply("❌ Lokatsiyani qayta yuboring.");
//     }
// };

// exports.confirmOrder = async (ctx) => {
//     try {
//         console.log("👉 confirmOrder handler triggered");
//         ctx.session.step = "payment_method";
//         return ctx.reply("💳 To‘lov turini tanlang:", Markup.inlineKeyboard([
//             [Markup.button.callback("💵 Naqd", "payment_cash")],
//             [Markup.button.callback("💳 Plastik karta", "payment_card")]
//         ]));
//     } catch (error) {
//         console.error("❌ Tasdiqlash bosqichi xatosi:", error);
//         ctx.reply("❌ Xatolik yuz berdi. Qayta urinib ko‘ring.");
//     }
// };

// exports.handlePaymentMethod = async (ctx) => {
//     ctx.session.tulovturi = ctx.callbackQuery.data === "payment_cash" ? "Naqd" : "Plastik karta";
//     ctx.session.step = "payment_amount";
//     return ctx.reply("💰 To‘lov holatini tanlang:", Markup.inlineKeyboard([
//         [Markup.button.callback("100% to‘lov", "full_payment")],
//         [Markup.button.callback("Qisman to‘lov", "partial_payment")]
//     ]));
// };

// exports.handlePaymentAmount = async (ctx) => {
//     if (ctx.callbackQuery.data === "full_payment") {
//         ctx.session.tulovholati = `To‘liq (${ctx.session.cost} so'm)`;
//         ctx.session.step = "upload_cheque";
//         return ctx.reply("📸 Iltimos, chek rasmni yuboring.");
//     } else {
//         ctx.session.step = "ask_partial_amount";
//         return ctx.reply("💸 Qancha to‘lamoqchi (so'm)?");
//     }
// };

// exports.handleChequeImage = async (ctx) => {
//     try {
//         const photo = ctx.message.photo;
//         if (!photo) return ctx.reply("❌ Iltimos, rasm yuboring.");

//         const fileId = photo[photo.length - 1].file_id;
//         ctx.session.rasm = fileId;

//         const order = new Order({
//             telefon: ctx.session.phone,
//             ism: ctx.session.fullName,
//             miqdor: ctx.session.waterQuantity,
//             lokatsiya: `${ctx.session.location.latitude},${ctx.session.location.longitude}`,
//             kuryer: "bot",
//             tulovturi: ctx.session.tulovturi,
//             tulovholati: ctx.session.tulovholati,
//             rasm: fileId,
//             partialAmount: ctx.session.partialAmount // Store partial payment amount if exists
//         });

//         await order.save();

//         ctx.reply("✅ Buyurtma saqlandi! Rahmat.");
//         ctx.session = { step: "phone" };
//     } catch (e) {
//         console.error("❌ Rasmni saqlashda xatolik:", e);
//         ctx.reply("❌ Chekni saqlashda muammo yuz berdi.");
//     }
// };

// exports.declineOrder = async (ctx) => {
//     try {
//         const archive = new Archive({
//             telefon: ctx.session.phone,
//             ism: ctx.session.fullName,
//             location: ctx.session.location,
//             waterQuantity: ctx.session.waterQuantity,
//             cost: ctx.session.cost
//         });
//         await archive.save();
//         ctx.reply("❌ Zakaz bekor qilindi va arxivga saqlandi.");
//         ctx.session = { step: "phone" };
//     } catch (error) {
//         console.error("❌ Bekor qilishda xatolik:", error);
//         ctx.reply("❌ Arxivlashda muammo yuz berdi.");
//     }
// };
const { Markup } = require("telegraf");
const Client = require("../../models/Client");
const Order = require("../../models/zakaz");
const Archive = require("../../models/Archive");

exports.start = async (ctx) => {
    try {
        const user = ctx.from;
        const userName = user.first_name;
        const userPhone = user.phone_number || "Telefon raqam mavjud emas"; // You can adjust this based on availability
        
        ctx.session = { step: "phone" };

        // Greet the user with their name and phone number
        ctx.reply(
            `Salom, ${userName}! Sizning telefon raqamingiz: ${userPhone}`,
            Markup.keyboard([
                [{ text: "Yangi Zakaz" }, { text: "Ishni Yakunlash" }]
            ])
            .resize()
            .oneTime()
        );
    } catch (e) {
        console.error("❌ Muammo bor - BotControllerda:", e);
        ctx.reply("❌ Ichki xatolik yuz berdi, keyinroq urinib ko‘ring.");
    }
};

exports.handleText = async (ctx) => {
    try {
        if (!ctx.session) ctx.session = {};

        const step = ctx.session.step;
        const text = ctx.message.text;

        // Check if the user pressed 'Yangi Zakaz' or 'Ishni Yakunlash'
        if (text === "Yangi Zakaz") {
            ctx.session.step = "phone";
            return ctx.reply("Ishni boshladik. Mijozning telefon raqamini kiriting 931234567 tarzida 9 ta raqam kiriting");
        }

        if (text === "Ishni Yakunlash") {
            return ctx.reply("Ish yakunlandi. Yaxshi kunlar!");
        }

        if (step === "phone") {
            const phoneNumber = text.trim();
            if (phoneNumber.length !== 9 || isNaN(phoneNumber)) {
                return ctx.reply("⚠️ Telefon raqamni xato kiritdingiz! 931234567 tarzida 9 ta raqam kiriting.");
            }
        
            ctx.session.phone = "998" + phoneNumber; // 998 ni oldidan avtomatik qo‘shadi
            ctx.session.step = "check_client";
        
            const existingClient = await Client.findOne({ telefon: ctx.session.phone });
        
            if (existingClient) {
                ctx.session.fullName = existingClient.ism;
                ctx.session.clientId = existingClient._id;
                ctx.session.step = "quantity";  // Skip full name and go straight to quantity.
        
                return ctx.reply(
                    `✅ Mijoz topildi!\n👤 Ismi: ${existingClient.ism}\n📞 Telefon: ${existingClient.telefon}\n\n💧 Qancha suv kerak?`,
                    Markup.removeKeyboard()
                );
            }
        
            // Agar client topilmasa
            ctx.session.step = "fullName";
            return ctx.reply("🔹 Yangi mijoz! To'liq ismini kiriting:");
        }
        

        if (step === "fullName") {
            ctx.session.fullName = text;
            ctx.session.step = "location";
            return ctx.reply(
                "📍 Iltimos, Mijoz lokatsiyasini yuboring.",
                Markup.keyboard([ [{ text: "📍 Mijoz lokatsiyasini yuboring", request_location: true } ]]).resize()
            );
        }

        if (step === "quantity") {
            const quantity = parseInt(text, 10);
            if (isNaN(quantity) || quantity <= 0) {
                return ctx.reply("⚠️ Boklajka miqdorini raqam bilan kiriting.");
            }

            ctx.session.waterQuantity = quantity;
            ctx.session.cost = quantity * 5000; // example price
            ctx.session.step = "confirmation";

            return ctx.reply(
                `📝 Zakaz:\n👤 Ismi: ${ctx.session.fullName}\n📞 Tel: ${ctx.session.phone}\n📍 Lokatsiya: ${ctx.session.location.latitude}, ${ctx.session.location.longitude}\n💧 Miqdor: ${quantity}\n💰 Narxi: ${ctx.session.cost} so'm`,
                Markup.inlineKeyboard([
                    [Markup.button.callback("✅ Tasdiqlash", "confirm_order")],
                    [Markup.button.callback("❌ Bekor qilish", "decline_order")]
                ])
            );
        }

        if (step === "ask_partial_amount") {
            const amount = parseInt(text, 10);
            if (isNaN(amount) || amount <= 0) {
                return ctx.reply("⚠️ To‘lov miqdorini to‘g‘ri kiriting.");
            }
            ctx.session.tulovholati = `Qisman (${amount} so'm)`;
            ctx.session.partialAmount = amount;
            ctx.session.step = "upload_cheque";
            return ctx.reply("📸 Iltimos, chek rasmni yuboring.");
        }
    } catch (error) {
        console.error("❌ Xatolik:", error);
        ctx.reply("❌ Ichki xatolik yuz berdi, keyinroq urinib ko‘ring.");
    }
};

exports.handleLocation = async (ctx) => {
    try {
        if (!ctx.message.location) return ctx.reply("❌ Lokatsiya yuborilmadi. Qayta urinib ko‘ring.");

        ctx.session.location = ctx.message.location;
        ctx.session.step = "quantity";

        return ctx.reply("💧 Qancha baklajka suv xohlayapti?", Markup.removeKeyboard());
    } catch (e) {
        console.error("❌ Lokatsiya xatoligi:", e);
        ctx.reply("❌ Lokatsiyani qayta yuboring.");
    }
};

exports.confirmOrder = async (ctx) => {
    try {
        console.log("👉 confirmOrder handler triggered");
        ctx.session.step = "payment_method";
        return ctx.reply("💳 To‘lov turini tanlang:", Markup.inlineKeyboard([
            [Markup.button.callback("💵 Naqd", "payment_cash")],
            [Markup.button.callback("💳 Plastik karta", "payment_card")]
        ]));
    } catch (error) {
        console.error("❌ Tasdiqlash bosqichi xatosi:", error);
        ctx.reply("❌ Xatolik yuz berdi. Qayta urinib ko‘ring.");
    }
};

exports.handlePaymentMethod = async (ctx) => {
    ctx.session.tulovturi = ctx.callbackQuery.data === "payment_cash" ? "Naqd" : "Plastik karta";
    ctx.session.step = "payment_amount";
    return ctx.reply("💰 To‘lov holatini tanlang:", Markup.inlineKeyboard([
        [Markup.button.callback("100% to‘lov", "full_payment")],
        [Markup.button.callback("Qisman to‘lov", "partial_payment")]
    ]));
};

exports.handlePaymentAmount = async (ctx) => {
    if (ctx.callbackQuery.data === "full_payment") {
        ctx.session.tulovholati = `To‘liq (${ctx.session.cost} so'm)`;
        ctx.session.step = "upload_cheque";
        return ctx.reply("📸 Iltimos, chek rasmni yuboring.");
    } else {
        ctx.session.step = "ask_partial_amount";
        return ctx.reply("💸 Qancha to‘lamoqchi (so'm)?");
    }
};

exports.handleChequeImage = async (ctx) => {
    try {
        const photo = ctx.message.photo;
        if (!photo) return ctx.reply("❌ Iltimos, rasm yuboring.");

        const fileId = photo[photo.length - 1].file_id;
        ctx.session.rasm = fileId;

        const order = new Order({
            telefon: ctx.session.phone,
            ism: ctx.session.fullName,
            miqdor: ctx.session.waterQuantity,
            lokatsiya: `${ctx.session.location.latitude},${ctx.session.location.longitude}`,
            kuryer: "bot",
            tulovturi: ctx.session.tulovturi,
            tulovholati: ctx.session.tulovholati,
            rasm: fileId,
            partialAmount: ctx.session.partialAmount // Store partial payment amount if exists
        });

        await order.save();

        ctx.reply("✅ Buyurtma saqlandi! Rahmat.");
        ctx.session = { step: "phone" };

        // Show the menu after order is completed
        return ctx.reply(
            "Yangi Zakaz yoki Chiqish uchun tanlang:",
            Markup.keyboard([
                [{ text: "Yangi Zakaz" }, { text: "Ishni Yakunlash" }]
            ])
            .resize()
            .oneTime()
        );
    } catch (e) {
        console.error("❌ Rasmni saqlashda xatolik:", e);
        ctx.reply("❌ Chekni saqlashda muammo yuz berdi.");
    }
};

exports.declineOrder = async (ctx) => {
    try {
        const archive = new Archive({
            telefon: ctx.session.phone,
            ism: ctx.session.fullName,
            location: ctx.session.location,
            waterQuantity: ctx.session.waterQuantity,
            cost: ctx.session.cost
        });
        await archive.save();
        ctx.reply("❌ Zakaz bekor qilindi va arxivga saqlandi.");

        // Show the menu again after decline
        ctx.session = { step: "phone" };
        return ctx.reply(
            "Yangi Zakaz yoki Chiqish uchun tanlang:",
            Markup.keyboard([
                [{ text: "Yangi Zakaz" }, { text: "Ishni Yakunlash" }]
            ])
            .resize()
            .oneTime()
        );
    } catch (error) {
        console.error("❌ Bekor qilishda xatolik:", error);
        ctx.reply("❌ Arxivlashda muammo yuz berdi.");
    }
};
