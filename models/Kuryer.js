const {Schema, model} = require('mongoose');

const kuryerChema = new Schema({
    ism: String, 
    telefon: String,
    hudud: [String]
});

module.exports = model('Kuryer', kuryerChema);