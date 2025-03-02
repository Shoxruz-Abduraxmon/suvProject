const Client = require('../models/Client');
const Zakaz = require('../models/zakaz');

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find().lean();
        const now = new Date();
        const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);

        let inactive10Count = 0;
        let inactive20Count = 0;

        const clientsWithLastOrder = await Promise.all(clients.map(async (client) => {
            const lastOrder = await Zakaz.findOne({ telefon: client.telefon })
                .sort({ createdAt: -1 })
                .lean();

            const lastOrderDate = lastOrder?.createdAt ? lastOrder.createdAt.toISOString().split('T')[0] : 'Zakaz yo‘q';
            const inactive = lastOrder && lastOrder.createdAt < tenDaysAgo;
            const isInactive20 = lastOrder && lastOrder.createdAt < twentyDaysAgo;

            if (inactive) inactive10Count++;
            if (isInactive20) inactive20Count++;

            return {
                ...client,
                lastOrderDate,
                inactive,
                isInactive20
            };
        }));

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
