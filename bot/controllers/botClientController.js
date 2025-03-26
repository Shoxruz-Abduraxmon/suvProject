const Client = require('../../models/Client')


exports.start = async (ctx) => {
    try {
        ctx.session.step = "phone";
        ctx.reply("📲 Mijozning telefon raqamini kiriting:");
    } catch (e) {
        console.error("❌ Muammo bor - BotControllerda:", e);
        ctx.reply("❌ Ichki xatolik yuz berdi, keyinroq urinib ko‘ring.");
    }
};

exports.handleText = async (ctx) => {
    try {
        if (!ctx.session) ctx.session = {};

        if (ctx.session.step === "phone") {
            const phoneNumber = ctx.message.text.trim();
            ctx.session.phone = phoneNumber;

            console.log("🔍 Mijozni qidiryapman:", phoneNumber);

            const client = await Client.findOne({ telefon: phoneNumber });

            if (client) {
                ctx.session.fullName = client.ism;
                ctx.session.location = client.lokatsiya;
                ctx.session.step = "quantity";
                return ctx.reply(
                    `✅ Mijoz bazada bor!
👤 Ism: ${client.ism}
📍 Lokatsiya: ${client.lokatsiya}

💧 Qancha suv kerak?`
                );
            } else {
                ctx.session.step = "fullName";
                return ctx.reply("🔹 Yangi mijoz! Ismini kiriting:");
            }
        }
    } catch (error) {
        console.error("❌ Xatolik:", error);
        ctx.reply("❌ Ichki xatolik yuz berdi, keyinroq urinib ko‘ring.");
    }
};
