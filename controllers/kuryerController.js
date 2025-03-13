const Zakaz = require('../models/zakaz');

exports.getKuryer = async (req, res) => {
    try{
        const zakazlar = await Zakaz.find().lean();
    const kuryerlar = {}

    zakazlar.forEach(zakaz => {
        const kuryerName = zakaz.kuryer
        const kuryerId = zakaz._id

        if(!kuryerlar[kuryerName]){
            kuryerlar[kuryerName] ={
                id: kuryerId,
                zakazlar: []
            }
        }
        kuryerlar[kuryerName].zakazlar.push(zakaz);
    })
    res.render('kuryer', {
        title: 'Kuryer zakazlari',
        zakazlar,
        kuryerlar
    })
    }catch(e) {
        console.log(e + 'kuryerControllerda Muammocha bor ekandaaa');
    }
    
}

