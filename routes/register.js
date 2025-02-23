const Router = require('express');
const {getRegister, postRegister} = require('../controllers/registerController');

const router = Router();

router.get('/register', getRegister);
router.post('/register', postRegister);

module.exports = router;