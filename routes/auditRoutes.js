const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { requireLogin, requireAdmin } = require('../middleware/auth');

router.get('/', requireLogin, requireAdmin, auditController.index);

module.exports = router;
