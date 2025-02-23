const Client = require('../models/Client');
const Zakaz = require('../models/zakaz');

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find().lean();
        const now = new Date();
        const tenDaysAgo = new Date(now.setDate(now.getDate() - 10));

        
        const clientsWithLastOrder = await Promise.all(clients.map(async (client) => {
            const lastOrder = await Zakaz.findOne({ telefon: client.telefon })
                .sort({ createdAt: -1 }) 
                .lean();

            return {
                ...client,
                lastOrderDate: lastOrder && lastOrder.createdAt ? lastOrder.createdAt.toISOString().split('T')[0] : 'Zakaz yo‘q', // Undefined bo‘lsa xatolik bermaydi
                inactive: lastOrder && lastOrder.createdAt < tenDaysAgo 
            };
        }));

        res.render('clients', {
            title: 'Mijozlar Ro‘yxati',
            clients: clientsWithLastOrder
        });
    } catch (e) {
        console.error('Mijozlarni olishda xatolik:', e);
        res.status(500).send('Xatolik yuz berdi');
    }
};
