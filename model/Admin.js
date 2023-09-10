// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: true, // Admins are created with admin privileges by default
  },
  // Add other admin-specific fields as needed
});

module.exports = mongoose.model('Admin', adminSchema);
