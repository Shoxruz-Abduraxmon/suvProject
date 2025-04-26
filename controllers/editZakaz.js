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

exports.editPost = async (req, res) => {
    try{
        const {telefon, ism, miqdor, lokatsiya} = req.body;
        const id = req.params.id;
        const editPost = await Zakaz.findByIdAndUpdate(id, req.body, {new: true});

        if(!editPost) {
            return res.send('Bunday buyurtma topilmadi !!!');
        }
        console.log(editPost);
        res.redirect('/home');
    }catch (e) {
        console.log(e + "controller Editdagi postda muammo");
    }
}

exports.delitePost = async (req, res) => {
    try{
        const id = req.params.id;

        const order = await Zakaz.findById(id);
     if (!order) {
     return res.status(404).send("Buyurtma topilmadi!");
     }

        await Zakaz.findByIdAndDelete(id);

        res.redirect('/home');
    }catch (e) {
        console.log(e + 'controllers editZakazdagi delitePostda muammo');
    }
}