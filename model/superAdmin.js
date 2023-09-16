const mongoose = require('mongoose');

const superadminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create a predefined superadmin record
superadminSchema.statics.createPredefinedSuperadmin = async function () {
  const predefinedSuperadmin = new this({
    email: 'superadmin@example.com', // Change this to the superadmin's email
    password: 'superadminpassword', // Change this to the superadmin's password
  });

  await predefinedSuperadmin.save();
  return predefinedSuperadmin;
};

const Superadmin = mongoose.model('SuperAdmin', superadminSchema);

module.exports = Superadmin;
