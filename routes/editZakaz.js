const express = require('express');
const { editZakazGet, editPost, delitePost } = require('../controllers/editZakaz');
const router = express.Router();

router.get('/editZakaz/:id', editZakazGet);
router.post('/edit/:id', editPost);
router.post('/delite/:id', delitePost);

module.exports = router;


