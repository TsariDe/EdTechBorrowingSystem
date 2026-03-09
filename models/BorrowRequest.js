const mongoose = require('mongoose');

const borrowItemSchema = new mongoose.Schema({
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    equipmentName: { type: String, required: true }, // snapshot
    quantity: { type: Number, required: true, min: 1 },
    returned: { type: Boolean, default: false },
});

const borrowRequestSchema = new mongoose.Schema({
    borrower: { type: String, required: true, trim: true },
    borrowerType: { type: String, enum: ['Student', 'Staff', 'Department', 'Other'], default: 'Student' },
    purpose: { type: String, required: true, trim: true },
    items: [borrowItemSchema],
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Released', 'Returned', 'Rejected'],
        default: 'Pending',
    },
    dateNeeded: { type: Date, required: true },
    dateToReturn: { type: Date, required: true },

    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },

    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },

    releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    releasedAt: { type: Date },

    returnReceivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    returnedAt: { type: Date },

    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
