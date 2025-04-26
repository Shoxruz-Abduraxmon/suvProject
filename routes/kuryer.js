const express = require('express');
const {getKuryer} = require('../controllers/kuryerController');

const router = express.Router();

router.get('/kuryer', getKuryer);

module.exports = router;
