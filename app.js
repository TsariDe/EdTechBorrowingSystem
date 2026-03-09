require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
}));

// Flash messages
app.use(flash());

// Locals for all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.messages = {        // ← ADD THIS
        success: req.flash('success'),
        error: req.flash('error')
    };
    next();
});

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/equipment', require('./routes/equipmentRoutes'));
app.use('/borrow', require('./routes/borrowRoutes'));
app.use('/staff', require('./routes/staffRoutes'));
app.use('/audit-logs', require('./routes/auditRoutes'));
app.use('/history', require('./routes/historyRoutes'));
app.use('/account', require('./routes/accountRoutes'));

// Home redirect
app.get('/', (req, res) => res.redirect('/dashboard'));

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { message: 'Page not found.', session: req.session });
});

app.listen(PORT, () => {
    console.log(`🚀 EdTech Borrowing System running at http://localhost:${PORT}`);
});
