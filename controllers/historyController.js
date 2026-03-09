const BorrowRequest = require('../models/BorrowRequest');
const moment = require('moment');

// GET /history
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
            .populate('approvedBy', 'name')
            .populate('releasedBy', 'name')
            .populate('returnReceivedBy', 'name');

        res.render('history/index', {
            title: 'Activity History',
            requests,
            status: status || '', from: from || '', to: to || '', search: search || '',
            moment,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error') },
        });
    } catch (err) {
        req.flash('error', 'Failed to load history.'); res.redirect('/dashboard');
    }
};
