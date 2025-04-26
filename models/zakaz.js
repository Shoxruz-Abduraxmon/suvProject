const { Schema, model } = require('mongoose');

const zakazSchema = new Schema({
    telefon: { type: String, required: true },
    ism: { type: String, required: true },
    miqdor: { type: String, required: true },
    lokatsiya: { type: String, required: true },
    kuryer: { type: String, required: true },
    zakazstatusi: { type: String, enum: ['waiting', 'accepted', 'in progress', 'delivered', 'closed'], default: 'waiting' },
  	tulovturi: String,
  	tulovholati: String,
  	rasm: String,
}, { timestamps: true });

module.exports = model('Zakaz', zakazSchema);
