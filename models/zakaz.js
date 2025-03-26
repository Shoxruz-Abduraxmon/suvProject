const { Schema, model } = require('mongoose');

const zakazSchema = new Schema({
    telefon: { type: String, required: true },
    ism: { type: String, required: true },
    miqdor: { type: String, required: true },
    lokatsiya: { type: String, required: true },
    kuryer: { type: String, required: true }
}, { timestamps: true });

module.exports = model('Zakaz', zakazSchema);
