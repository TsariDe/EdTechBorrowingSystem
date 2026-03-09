const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { requireLogin } = require('../middleware/auth');

router.get('/settings', requireLogin, accountController.getSettings);
router.post('/update-profile', requireLogin, accountController.postUpdateProfile);
router.post('/change-password', requireLogin, accountController.postChangePassword);

module.exports = router;
