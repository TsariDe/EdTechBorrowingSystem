const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, historyController.index);

module.exports = router;
