const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, equipmentController.index);
router.get('/new', requireLogin, equipmentController.getCreate);
router.post('/', requireLogin, equipmentController.create);
router.get('/:id/edit', requireLogin, equipmentController.getEdit);
router.post('/:id/edit', requireLogin, equipmentController.update);
router.post('/:id/delete', requireLogin, equipmentController.remove);

module.exports = router;
