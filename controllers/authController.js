const User = require('../models/User');

// GET /login
exports.getLogin = (req, res) => {
    if (req.session && req.session.userId) return res.redirect('/dashboard');
    res.render('auth/login', { title: 'Login', error: req.flash('error'), success: req.flash('success') });
};

// POST /login
exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.toLowerCase(), isActive: true });
        if (!user) {
            req.flash('error', 'Invalid username or password.');
            return res.redirect('/login');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid username or password.');
            return res.redirect('/login');
        }
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.role = user.role;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/login');
    }
};

// GET /logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};
