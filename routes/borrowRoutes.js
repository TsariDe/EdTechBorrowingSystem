const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { requireLogin, requirePermission } = require('../middleware/auth');

// Creating a borrow request requires canCreateBorrowRequest
router.get('/new', requireLogin, requirePermission('canCreateBorrowRequest'), borrowController.getNew);
router.post('/preview', requireLogin, requirePermission('canCreateBorrowRequest'), borrowController.postPreview);
router.post('/submit', requireLogin, requirePermission('canCreateBorrowRequest'), borrowController.submit);

// Viewing requests — all logged-in users can view
router.get('/', requireLogin, borrowController.index);
router.get('/:id', requireLogin, borrowController.getDetail);

// Approve/reject — requires canApproveRequests
router.post('/:id/approve', requireLogin, requirePermission('canApproveRequests'), borrowController.approve);
router.post('/:id/reject', requireLogin, requirePermission('canApproveRequests'), borrowController.reject);

// Release — requires canReleaseItems
router.post('/:id/release', requireLogin, requirePermission('canReleaseItems'), borrowController.release);

// Return — requires canReceiveReturns
router.post('/:id/return', requireLogin, requirePermission('canReceiveReturns'), borrowController.receiveReturn);

module.exports = router;
