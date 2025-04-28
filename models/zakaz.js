const { Schema, model } = require('mongoose');

const zakazSchema = new Schema({
  telefon: { type: String, required: true },
  ism: { type: String, required: true },
  miqdor: { type: Number, required: true },
  lokatsiya: { type: String, required: true },
  kuryer: { type: String, default: 'bot' },
  zakazstatusi: { 
      type: String, 
      enum: ['waiting', 'accepted', 'in progress', 'delivered', 'closed'], 
      default: 'waiting' 
  },
  tulovturi: String,
  tulovholati: String,
  rasm: String,
  partialAmount: { type: Number }, 
}, { timestamps: true });


module.exports = model('Zakaz', zakazSchema);
