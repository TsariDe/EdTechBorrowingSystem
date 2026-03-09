const BorrowRequest = require('../models/BorrowRequest');
const Equipment = require('../models/Equipment');
const AuditLog = require('../models/AuditLog');
const moment = require('moment');

// GET /borrow/new - Render borrow form with equipment checklist
exports.getNew = async (req, res) => {
    try {
        const equipment = await Equipment.find({ isActive: true, availableQty: { $gt: 0 } }).sort({ name: 1 });
        res.render('borrow/new', {
            title: 'New Borrow Request',
            equipment,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error') },
            prefill: req.session.borrowPrefill || null,  // ← add this
        });
        req.session.borrowPrefill = null; // clear after use
    } catch (err) {
        req.flash('error', 'Failed to load equipment.'); res.redirect('/dashboard');
    }
};

// POST /borrow/preview - Show receipt preview
exports.postPreview = async (req, res) => {
    try {
        const { borrower, borrowerType, purpose, dateNeeded, timeNeeded, dateToReturn, timeToReturn, notes } = req.body;

        // Merge date + time for both fields
        const dateNeededFull = timeNeeded
            ? new Date(`${dateNeeded}T${timeNeeded}`)
            : new Date(dateNeeded);

        const dateToReturnFull = timeToReturn
            ? new Date(`${dateToReturn}T${timeToReturn}`)
            : new Date(dateToReturn);
        let itemIds = req.body['itemIds[]'] || req.body.itemIds || [];
        let itemQtys = req.body['itemQtys[]'] || req.body.itemQtys || [];
        if (!Array.isArray(itemIds)) itemIds = [itemIds];
        if (!Array.isArray(itemQtys)) itemQtys = [itemQtys];

        req.session.borrowPrefill = {
            borrower, borrowerType, purpose,
            dateNeeded, timeNeeded,
            dateToReturn, timeToReturn,
            notes, itemIds, itemQtys
        };

        const selectedItems = [];
        for (let i = 0; i < itemIds.length; i++) {
            if (!itemIds[i]) continue;
            const equip = await Equipment.findById(itemIds[i]);
            if (equip) {
                selectedItems.push({ equipment: equip, quantity: parseInt(itemQtys[i]) || 1 });
            }
        }

        if (!selectedItems.length) {
            req.flash('error', 'Please select at least one item.');
            return res.redirect('/borrow/new');
        }

        res.render('borrow/preview', {
            title: 'Borrow Receipt Preview',
            borrower, borrowerType, purpose, dateNeeded: dateNeededFull, dateToReturn: dateToReturnFull, notes,
            selectedItems,
            moment,
            user: { name: req.session.userName, role: req.session.role },
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to generate preview.'); res.redirect('/borrow/new');
    }
};

// POST /borrow/submit - Save borrow request
exports.submit = async (req, res) => {
    try {
        const { borrower, borrowerType, purpose, dateNeeded, timeNeeded, dateToReturn, timeToReturn, notes } = req.body;

        // Merge date + time for both fields
        const dateNeededFull = timeNeeded
            ? new Date(`${dateNeeded}T${timeNeeded}`)
            : new Date(dateNeeded);

        const dateToReturnFull = timeToReturn
            ? new Date(`${dateToReturn}T${timeToReturn}`)
            : new Date(dateToReturn);
        let itemIds = req.body['itemIds[]'] || req.body.itemIds || [];
        let itemQtys = req.body['itemQtys[]'] || req.body.itemQtys || [];
        if (!Array.isArray(itemIds)) itemIds = [itemIds];
        if (!Array.isArray(itemQtys)) itemQtys = [itemQtys];

        const items = [];
        for (let i = 0; i < itemIds.length; i++) {
            if (!itemIds[i]) continue;
            const equip = await Equipment.findById(itemIds[i]);
            if (equip) {
                items.push({ equipment: equip._id, equipmentName: equip.name, quantity: parseInt(itemQtys[i]) || 1 });
            }
        }
        if (!items.length) { req.flash('error', 'No valid items.'); return res.redirect('/borrow/new'); }

        const borrow = await BorrowRequest.create({
            borrower, borrowerType, purpose,
            dateNeeded: dateNeededFull,       // ← updated
            dateToReturn: dateToReturnFull,   // ← updated
            notes, items,
            requestedBy: req.session.userId,
        });

        await AuditLog.create({
            action: 'created', performedBy: req.session.userId,
            borrowRequest: borrow._id, borrowerName: borrower,
            note: `Request created with ${items.length} item(s).`,
        });

        req.flash('success', 'Borrow request submitted successfully!');
        res.redirect('/borrow');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to submit request.'); res.redirect('/borrow/new');
    }
};

// GET /borrow - List all borrow requests with filters
exports.index = async (req, res) => {
    try {
        const { status, from, to, search } = req.query;
        let query = {};
        if (status) query.status = status;
        if (search) query.borrower = { $regex: search, $options: 'i' };
        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = moment(to).endOf('day').toDate();
        }

        const requests = await BorrowRequest.find(query)
            .sort({ createdAt: -1 })
            .populate('requestedBy', 'name')
            .populate('approvedBy', 'name');

        res.render('borrow/index', {
            title: 'Borrow Requests',
            requests, status: status || '', from: from || '', to: to || '', search: search || '',
            moment,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error'), success: req.flash('success') },
        });
    } catch (err) {
        console.error(err); req.flash('error', 'Failed to load requests.'); res.redirect('/dashboard');
    }
};

// GET /borrow/:id - Detail view
exports.getDetail = async (req, res) => {
    try {
        const borrow = await BorrowRequest.findById(req.params.id)
            .populate('requestedBy', 'name')
            .populate('approvedBy', 'name')
            .populate('rejectedBy', 'name')
            .populate('releasedBy', 'name')
            .populate('returnReceivedBy', 'name')
            .populate('items.equipment');

        if (!borrow) { req.flash('error', 'Request not found.'); return res.redirect('/borrow'); }

        const auditLogs = await AuditLog.find({ borrowRequest: borrow._id })
            .sort({ timestamp: 1 })
            .populate('performedBy', 'name');

        res.render('borrow/detail', {
            title: 'Request Detail',
            borrow, auditLogs, moment,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error'), success: req.flash('success') },
        });
    } catch (err) {
        req.flash('error', 'Failed to load request.'); res.redirect('/borrow');
    }
};

// POST /borrow/:id/approve
exports.approve = async (req, res) => {
    try {
        const borrow = await BorrowRequest.findById(req.params.id);
        if (!borrow || borrow.status !== 'Pending') { req.flash('error', 'Cannot approve this request.'); return res.redirect('/borrow'); }
        borrow.status = 'Approved';
        borrow.approvedBy = req.session.userId;
        borrow.approvedAt = new Date();
        await borrow.save();
        await AuditLog.create({ action: 'approved', performedBy: req.session.userId, borrowRequest: borrow._id, borrowerName: borrow.borrower });
        req.flash('success', 'Request approved.');
        res.redirect('/borrow/' + borrow._id);
    } catch (err) {
        req.flash('error', 'Failed to approve.'); res.redirect('/borrow');
    }
};

// POST /borrow/:id/reject
exports.reject = async (req, res) => {
    try {
        const { reason } = req.body;
        const borrow = await BorrowRequest.findById(req.params.id);
        if (!borrow || borrow.status !== 'Pending') { req.flash('error', 'Cannot reject this request.'); return res.redirect('/borrow'); }
        borrow.status = 'Rejected';
        borrow.rejectedBy = req.session.userId;
        borrow.rejectedAt = new Date();
        borrow.rejectionReason = reason || 'No reason provided.';
        await borrow.save();
        await AuditLog.create({ action: 'rejected', performedBy: req.session.userId, borrowRequest: borrow._id, borrowerName: borrow.borrower, note: reason });
        req.flash('success', 'Request rejected.');
        res.redirect('/borrow/' + borrow._id);
    } catch (err) {
        req.flash('error', 'Failed to reject.'); res.redirect('/borrow');
    }
};

// POST /borrow/:id/release
exports.release = async (req, res) => {
    try {
        const borrow = await BorrowRequest.findById(req.params.id).populate('items.equipment');
        if (!borrow || borrow.status !== 'Approved') { req.flash('error', 'Cannot release this request.'); return res.redirect('/borrow'); }
        // Deduct available quantity
        for (const item of borrow.items) {
            await Equipment.findByIdAndUpdate(item.equipment._id, { $inc: { availableQty: -item.quantity } });
        }
        borrow.status = 'Released';
        borrow.releasedBy = req.session.userId;
        borrow.releasedAt = new Date();
        await borrow.save();
        await AuditLog.create({ action: 'released', performedBy: req.session.userId, borrowRequest: borrow._id, borrowerName: borrow.borrower });
        req.flash('success', 'Items released to borrower.');
        res.redirect('/borrow/' + borrow._id);
    } catch (err) {
        console.error(err); req.flash('error', 'Failed to release.'); res.redirect('/borrow');
    }
};

// POST /borrow/:id/return
exports.receiveReturn = async (req, res) => {
    try {
        const borrow = await BorrowRequest.findById(req.params.id).populate('items.equipment');
        if (!borrow || borrow.status !== 'Released') { req.flash('error', 'Cannot receive return for this request.'); return res.redirect('/borrow'); }
        // Restore available quantity
        for (const item of borrow.items) {
            await Equipment.findByIdAndUpdate(item.equipment._id, { $inc: { availableQty: item.quantity } });
        }
        borrow.status = 'Returned';
        borrow.returnReceivedBy = req.session.userId;
        borrow.returnedAt = new Date();
        await borrow.save();
        await AuditLog.create({ action: 'returned', performedBy: req.session.userId, borrowRequest: borrow._id, borrowerName: borrow.borrower });
        req.flash('success', 'Items returned and recorded.');
        res.redirect('/borrow/' + borrow._id);
    } catch (err) {
        console.error(err); req.flash('error', 'Failed to receive return.'); res.redirect('/borrow');
    }
};
