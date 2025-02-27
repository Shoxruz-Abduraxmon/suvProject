const Zakaz = require('../models/zakaz');
const Client = require('../models/Client');

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

// exports.getTeldanTopish = async (req, res) => {
//     const { telefon } = req.query;

//     if (!telefon) {
//         return res.status(400).json({ error: 'Telefon raqami kiritilmagan' });
//     }

//     try {
//         const oldZakaz = await Zakaz.findOne({ telefon }).sort({ createdAt: -1 }).lean();

//         if (!oldZakaz) {
//             return res.json({ order: null });
//         }

//         res.json({ order: oldZakaz });
//     } catch (e) {
//         console.error('Xatolik:', e);
//         res.status(500).json({ error: 'Server xatosi' });
//     }
// };

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

        console.log('Yangi buyurtma:', newZakaz);
        res.redirect('/home');
    } catch (e) {
        console.error('Buyurtmani saqlashda xatolik:', e);
        res.status(500).send('Xatolik yuz berdi');
    }
};




