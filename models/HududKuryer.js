const {Schema, model} = require('mongoose');

const kuryerHudud = new Schema({
    ism: String,
    kuryerZona: {type: Schema.Types.ObjectId, ref: Kuryer} 
});

module.exports = model('HududKuryer', kuryerHudud);