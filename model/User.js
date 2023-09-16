const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isVerifiedByAdmin : {
    type :Boolean,
    default : false,
  },
  verificationToken: String,
  documents: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId for image IDs
        default: mongoose.Types.ObjectId, // Generate a new ID by default
      },
      url: String,
      isVerified: {
        type: Boolean,
        default: false, // New documents are not verified by default
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
