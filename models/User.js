const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  isActive: { type: Boolean, default: true },
  permissions: {
    canApproveRequests: { type: Boolean, default: false },  // approve & reject borrow requests
    canReleaseItems: { type: Boolean, default: false },  // release items to borrower
    canReceiveReturns: { type: Boolean, default: false },  // receive/confirm returned items
    canManageEquipment: { type: Boolean, default: false },  // add, edit, remove equipment
    canCreateBorrowRequest: { type: Boolean, default: true }, // submit a borrow request
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
