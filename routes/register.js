const express = require('express');
const { getRegister, postRegister } = require('../controllers/registerController');

const router = express.Router();

router.get('/register', getRegister);
router.post('/register', postRegister);

module.exports = router;
