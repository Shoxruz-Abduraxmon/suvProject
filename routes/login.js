const Router = require('express');
const {getLogin, postLogin} = require('../controllers/loginController');

const router = Router();

router.get('/', getLogin);
router.post('/login', postLogin);

module.exports = router;
