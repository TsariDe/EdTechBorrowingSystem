const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { requireLogin, requirePermission } = require('../middleware/auth');

// Viewing equipment — all logged-in users
router.get('/', requireLogin, equipmentController.index);

// Add / edit / delete — requires canManageEquipment
router.get('/new', requireLogin, requirePermission('canManageEquipment'), equipmentController.getCreate);
router.post('/', requireLogin, requirePermission('canManageEquipment'), equipmentController.create);
router.get('/:id/edit', requireLogin, requirePermission('canManageEquipment'), equipmentController.getEdit);
router.post('/:id/edit', requireLogin, requirePermission('canManageEquipment'), equipmentController.update);
router.post('/:id/delete', requireLogin, requirePermission('canManageEquipment'), equipmentController.remove);

module.exports = router;
