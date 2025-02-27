const Router = require('express');
const { getHome, getTeldanTopish, postBuyurtma} = require('../controllers/zakazController');

const router = Router();

router.get('/home', getHome);
router.get('/get-order', getTeldanTopish);
router.post('/buyurtma', postBuyurtma);


module.exports = router;

