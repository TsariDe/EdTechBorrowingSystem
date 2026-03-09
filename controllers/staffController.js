const User = require('../models/User');

// GET /staff
exports.index = async (req, res) => {
    try {
        const staff = await User.find({ role: 'staff' }).sort({ name: 1 });
        res.render('staff/index', {
            title: 'Staff Management',
            staff,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error'), success: req.flash('success') },
        });
    } catch (err) {
        req.flash('error', 'Failed to load staff.'); res.redirect('/dashboard');
    }
};

// GET /staff/new
exports.getCreate = (req, res) => {
    res.render('staff/form', {
        title: 'Add Staff',
        staffMember: {},
        isEdit: false,
        user: { name: req.session.userName, role: req.session.role },
        messages: { error: req.flash('error') },
    });
};

// POST /staff
exports.create = async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const exists = await User.findOne({ username: username.toLowerCase() });
        if (exists) { req.flash('error', 'Username already taken.'); return res.redirect('/staff/new'); }
        await User.create({ name, username, password, role: 'staff' });
        req.flash('success', 'Staff member added successfully.');
        res.redirect('/staff');
    } catch (err) {
        req.flash('error', 'Failed to add staff.'); res.redirect('/staff/new');
    }
};

// GET /staff/:id/edit
exports.getEdit = async (req, res) => {
    try {
        const staffMember = await User.findById(req.params.id);
        if (!staffMember) { req.flash('error', 'Staff not found.'); return res.redirect('/staff'); }
        res.render('staff/form', {
            title: 'Edit Staff',
            staffMember,
            isEdit: true,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error') },
        });
    } catch (err) {
        req.flash('error', 'Failed to load staff.'); res.redirect('/staff');
    }
};

// POST /staff/:id/edit
exports.update = async (req, res) => {
    try {
        const { name, username } = req.body;
        const staffMember = await User.findById(req.params.id);
        if (!staffMember) { req.flash('error', 'Staff not found.'); return res.redirect('/staff'); }
        staffMember.name = name;
        staffMember.username = username.toLowerCase();
        if (req.body.password && req.body.password.trim() !== '') {
            staffMember.password = req.body.password;
        }
        await staffMember.save();
        req.flash('success', 'Staff updated successfully.');
        res.redirect('/staff');
    } catch (err) {
        req.flash('error', 'Failed to update staff.'); res.redirect('/staff');
    }
};

// POST /staff/:id/toggle-status
exports.toggleStatus = async (req, res) => {
    try {
        const staffMember = await User.findById(req.params.id);
        if (!staffMember) { req.flash('error', 'Staff not found.'); return res.redirect('/staff'); }
        staffMember.isActive = !staffMember.isActive;
        await staffMember.save();
        req.flash('success', `Staff member ${staffMember.isActive ? 'activated' : 'deactivated'}.`);
        res.redirect('/staff');
    } catch (err) {
        req.flash('error', 'Failed to update status.'); res.redirect('/staff');
    }
};
