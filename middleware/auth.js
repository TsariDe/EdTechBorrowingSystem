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
