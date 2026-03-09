const Equipment = require('../models/Equipment');

// GET /equipment
exports.index = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = { isActive: true };
        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;

        const equipment = await Equipment.find(query).sort({ name: 1 });
        const categories = await Equipment.distinct('category', { isActive: true });

        res.render('equipment/index', {
            title: 'Equipment',
            equipment,
            categories,
            search: search || '',
            selectedCategory: category || '',
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error'), success: req.flash('success') },
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to load equipment.');
        res.redirect('/dashboard');
    }
};

// GET /equipment/new
exports.getCreate = (req, res) => {
    res.render('equipment/form', {
        title: 'Add Equipment',
        equipment: {},
        isEdit: false,
        user: { name: req.session.userName, role: req.session.role },
        messages: { error: req.flash('error') },
    });
};

// POST /equipment
exports.create = async (req, res) => {
    try {
        const { name, category, description, quantity, condition } = req.body;
        const qty = parseInt(quantity);
        await Equipment.create({ name, category, description, quantity: qty, availableQty: qty, condition });
        req.flash('success', 'Equipment added successfully.');
        res.redirect('/equipment');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to add equipment.');
        res.redirect('/equipment/new');
    }
};

// GET /equipment/:id/edit
exports.getEdit = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) { req.flash('error', 'Equipment not found.'); return res.redirect('/equipment'); }
        res.render('equipment/form', {
            title: 'Edit Equipment',
            equipment,
            isEdit: true,
            user: { name: req.session.userName, role: req.session.role },
            messages: { error: req.flash('error') },
        });
    } catch (err) {
        req.flash('error', 'Failed to load equipment.'); res.redirect('/equipment');
    }
};

// POST /equipment/:id/edit
exports.update = async (req, res) => {
    try {
        const { name, category, description, quantity, condition } = req.body;
        const equip = await Equipment.findById(req.params.id);
        if (!equip) { req.flash('error', 'Equipment not found.'); return res.redirect('/equipment'); }
        const diff = parseInt(quantity) - equip.quantity;
        equip.name = name; equip.category = category; equip.description = description;
        equip.quantity = parseInt(quantity); equip.condition = condition;
        equip.availableQty = Math.max(0, equip.availableQty + diff);
        await equip.save();
        req.flash('success', 'Equipment updated successfully.');
        res.redirect('/equipment');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to update equipment.'); res.redirect('/equipment');
    }
};

// POST /equipment/:id/delete
exports.remove = async (req, res) => {
    try {
        await Equipment.findByIdAndUpdate(req.params.id, { isActive: false });
        req.flash('success', 'Equipment removed from inventory.');
        res.redirect('/equipment');
    } catch (err) {
        req.flash('error', 'Failed to delete equipment.'); res.redirect('/equipment');
    }
};
