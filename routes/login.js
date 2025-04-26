const express = require('express');
const { getLogin, postLogin } = require('../controllers/loginController');

const router = express.Router();

router.get('/', getLogin);
router.post('/login', postLogin);

module.exports = router;
