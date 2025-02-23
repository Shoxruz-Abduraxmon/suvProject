const express = require('express'); 
const { getClients } = require('../controllers/clientController');

const router = express.Router(); 

router.get('/clients', getClients);

module.exports = router;
