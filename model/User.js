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
      name: String, // Document name
      fileUrl: String, // URL or path to the uploaded file
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
