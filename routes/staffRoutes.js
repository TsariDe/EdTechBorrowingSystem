const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { requireLogin, requireAdmin } = require('../middleware/auth');

router.get('/', requireLogin, requireAdmin, staffController.index);
router.get('/new', requireLogin, requireAdmin, staffController.getCreate);
router.post('/', requireLogin, requireAdmin, staffController.create);
router.get('/:id/edit', requireLogin, requireAdmin, staffController.getEdit);
router.post('/:id/edit', requireLogin, requireAdmin, staffController.update);
router.post('/:id/toggle-status', requireLogin, requireAdmin, staffController.toggleStatus);

module.exports = router;
