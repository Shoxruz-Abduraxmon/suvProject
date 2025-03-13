const Client = require('../models/Client');
const Zakaz = require('../models/zakaz');

exports.getClients = async (req, res) => {
    try {
        const now = new Date();
        const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);

        // 1. Barcha mijozlarni olish
        const clients = await Client.find().lean();
        const telefonlar = clients.map(client => client.telefon);

        // 2. Har bir mijozning oxirgi buyurtmasini olish
        const lastOrders = await Zakaz.aggregate([
            { $match: { telefon: { $in: telefonlar } } }, // Mijozlarning buyurtmalarini olish
            { $sort: { createdAt: -1 } }, // Eng oxirgi buyurtmalarni oldinga olib kelish
            { 
                $group: { 
                    _id: "$telefon", 
                    lastOrder: { $first: "$createdAt" } // Eng oxirgi buyurtmani olish
                } 
            }
        ]);

        // 3. Buyurtmalarni mijozlar bilan bog‘lash
        const lastOrderMap = {};
        lastOrders.forEach(order => {
            lastOrderMap[order._id] = order.lastOrder;
        });

        let inactive10Count = 0;
        let inactive20Count = 0;

        // 4. Mijozlar ro‘yxatini tayyorlash
        const clientsWithLastOrder = clients.map(client => {
            const lastOrderDate = lastOrderMap[client.telefon] 
                ? new Date(lastOrderMap[client.telefon]).toISOString().split('T')[0] 
                : 'Zakaz yo‘q';

            const inactive = lastOrderMap[client.telefon] && lastOrderMap[client.telefon] < tenDaysAgo;
            const isInactive20 = lastOrderMap[client.telefon] && lastOrderMap[client.telefon] < twentyDaysAgo;

            if (inactive) inactive10Count++;
            if (isInactive20) inactive20Count++;

            return {
                ...client,
                lastOrderDate,
                inactive,
                isInactive20
            };
        });

        res.render('clients', {
            title: 'Mijozlar Ro‘yxati',
            clients: clientsWithLastOrder,
            clientlarsoni: clients.length,
            inactive10Count,
            inactive20Count
        });

    } catch (e) {
        console.error('Mijozlarni olishda xatolik:', e);
        res.status(500).send('Xatolik yuz berdi');
    }
};

