const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { requireLogin } = require('../middleware/auth');

router.get('/new', requireLogin, borrowController.getNew);
router.post('/preview', requireLogin, borrowController.postPreview);
router.post('/submit', requireLogin, borrowController.submit);
router.get('/', requireLogin, borrowController.index);
router.get('/:id', requireLogin, borrowController.getDetail);
router.post('/:id/approve', requireLogin, borrowController.approve);
router.post('/:id/reject', requireLogin, borrowController.reject);
router.post('/:id/release', requireLogin, borrowController.release);
router.post('/:id/return', requireLogin, borrowController.receiveReturn);

module.exports = router;
