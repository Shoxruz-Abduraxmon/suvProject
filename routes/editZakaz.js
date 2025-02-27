const express = require('express');
const { editZakazGet } = require('../controllers/editZakaz');
const router = express.Router();

router.get('/editZakaz/:id', editZakazGet);

module.exports = router;
