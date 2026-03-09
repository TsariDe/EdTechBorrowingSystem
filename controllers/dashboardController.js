const BorrowRequest = require('../models/BorrowRequest');
const Equipment = require('../models/Equipment');
const AuditLog = require('../models/AuditLog');
const moment = require('moment');

exports.getDashboard = async (req, res) => {
    try {
        const totalEquipment = await Equipment.countDocuments({ isActive: true });
        const pendingCount = await BorrowRequest.countDocuments({ status: 'Pending' });
        const activeCount = await BorrowRequest.countDocuments({ status: { $in: ['Approved', 'Released'] } });

        const today = moment().startOf('day').toDate();
        const tomorrow = moment().endOf('day').toDate();
        const returnedToday = await BorrowRequest.countDocuments({ status: 'Returned', returnedAt: { $gte: today, $lte: tomorrow } });

        const recentRequests = await BorrowRequest.find()
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('requestedBy', 'name');

        const recentAudit = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(6)
            .populate('performedBy', 'name')
            .populate('borrowRequest', 'borrower');

        res.render('dashboard/index', {
            title: 'Dashboard',
            totalEquipment,
            pendingCount,
            activeCount,
            returnedToday,
            recentRequests,
            recentAudit,
            moment,
            user: { name: req.session.userName, role: req.session.role },
        });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Failed to load dashboard.' });
    }
};
