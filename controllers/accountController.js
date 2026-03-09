const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /account/settings
exports.getSettings = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        res.render('account/settings', {
            title: 'Account Settings',
            currentUser,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error'), success: req.flash('success') },
        });
    } catch (err) {
        req.flash('error', 'Failed to load settings.'); res.redirect('/dashboard');
    }
};

// POST /account/update-profile
exports.postUpdateProfile = async (req, res) => {
    try {
        const { name, username } = req.body;
        const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.session.userId } });
        if (existing) { req.flash('error', 'Username is already taken.'); return res.redirect('/account/settings'); }

        const currentUser = await User.findById(req.session.userId);
        currentUser.name = name;
        currentUser.username = username.toLowerCase();
        await currentUser.save();

        req.session.userName = name;
        req.flash('success', 'Profile updated successfully.');
        res.redirect('/account/settings');
    } catch (err) {
        req.flash('error', 'Failed to update profile.'); res.redirect('/account/settings');
    }
};

// POST /account/change-password
exports.postChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match.');
            return res.redirect('/account/settings');
        }
        if (newPassword.length < 6) {
            req.flash('error', 'Password must be at least 6 characters.');
            return res.redirect('/account/settings');
        }
        const currentUser = await User.findById(req.session.userId);
        const isMatch = await currentUser.comparePassword(oldPassword);
        if (!isMatch) {
            req.flash('error', 'Current password is incorrect.');
            return res.redirect('/account/settings');
        }
        currentUser.password = newPassword;
        await currentUser.save();
        req.flash('success', 'Password changed successfully.');
        res.redirect('/account/settings');
    } catch (err) {
        req.flash('error', 'Failed to change password.'); res.redirect('/account/settings');
    }
};
