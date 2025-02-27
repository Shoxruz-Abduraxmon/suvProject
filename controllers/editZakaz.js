const Zakaz = require('../models/zakaz');

exports.editZakazGet = async (req, res) => {
    try {
        const id = req.params.id;
        const edit = await Zakaz.findById(id).lean();

        if (!edit) {
            return res.send('Zakaz topilmadi!');
        }

        res.render('editZakaz', {
            title: 'Buyurtmani o`zgartirish',
            edit
        });
    } catch (e) {
        console.log('Controllers EdetZakazda muammo:', e);
        
};
}
