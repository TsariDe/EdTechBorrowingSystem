const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['approved', 'rejected', 'released', 'returned', 'created', 'cancelled'],
        required: true,
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', required: true },
    borrowerName: { type: String }, // snapshot
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
