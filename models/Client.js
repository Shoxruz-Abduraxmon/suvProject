const mongoose =require('mongoose');

const ClientSchema = new mongoose.Schema({
    telefon: {type: String, required: true, unique: true},
    ism: {type: String, required: true},
    lokatsiya: {type: String, required: true}
});

module.exports = mongoose.model('Client', ClientSchema);