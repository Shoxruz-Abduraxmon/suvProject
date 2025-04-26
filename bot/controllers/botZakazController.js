// exports.confirmOrder = async (ctx) => {
//     try {
//         if (!ctx.session.fullName || !ctx.session.location) {
//             return ctx.reply("❌ Buyurtma berish uchun avval ma’lumotlarni to‘ldiring!");
//         }

//         await ctx.reply(
//             `✅ Buyurtma tasdiqlandi!
// 👤 Mijoz: ${ctx.session.fullName}
// 📍 Lokatsiya: ${ctx.session.location}
// 📲 Telefon: ${ctx.session.phone}`
//         );

//         ctx.session = {}; // Sessionni tozalash
//     } catch (error) {
//         console.error("❌ Buyurtma xatosi:", error);
//         ctx.reply("❌ Buyurtma tasdiqlashda muammo yuz berdi.");
//     }
// };
