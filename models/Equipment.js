const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    availableQty: { type: Number, required: true, min: 0, default: 1 },
    condition: { type: String, enum: ['Good', 'Fair', 'Needs Repair', 'Retired'], default: 'Good' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
