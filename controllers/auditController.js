const AuditLog = require('../models/AuditLog');
const moment = require('moment');

// GET /audit-logs
exports.index = async (req, res) => {
    try {
        const { action, from, to, search } = req.query;
        let query = {};
        if (action) query.action = action;
        if (search) query.borrowerName = { $regex: search, $options: 'i' };
        if (from || to) {
            query.timestamp = {};
            if (from) query.timestamp.$gte = new Date(from);
            if (to) query.timestamp.$lte = moment(to).endOf('day').toDate();
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .populate('performedBy', 'name')
            .populate('borrowRequest', 'borrower');

        res.render('audit/index', {
            title: 'Audit Logs',
            logs,
            action: action || '', from: from || '', to: to || '', search: search || '',
            moment,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error') },
        });
    } catch (err) {
        req.flash('error', 'Failed to load audit logs.'); res.redirect('/dashboard');
    }
};
