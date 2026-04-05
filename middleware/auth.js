const User = require('../models/User');

// Require login middleware
exports.requireLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        req.flash('error', 'Please log in to continue.');
        return res.redirect('/login');
    }
    next();
};

// Require admin role middleware
exports.requireAdmin = (req, res, next) => {
    if (!req.session || req.session.role !== 'admin') {
        req.flash('error', 'Access denied. Admins only.');
        return res.redirect('/dashboard');
    }
    next();
};

// Generic permission checker factory
// Admin always passes. Staff must have the specific permission enabled.
exports.requirePermission = (permKey) => {
    return async (req, res, next) => {
        // Admins bypass all permission checks
        if (req.session.role === 'admin') return next();

        const user = await User.findById(req.session.userId);
        if (!user || !user.permissions || !user.permissions[permKey]) {
            req.flash('error', 'You do not have permission to perform this action.');
            return res.redirect('/dashboard');
        }
        next();
    };
};
