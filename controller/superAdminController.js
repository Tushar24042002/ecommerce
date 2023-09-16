const Superadmin = require('../model/superAdmin');
const User = require('../model/User');
const Admin = require('../model/Admin');

// Get the predefined superadmin's details
const getPredefinedSuperadmin = async (req, res) => {
  try {
    // Find the predefined superadmin by email
    const superadmin = await Superadmin.findOne({ email: 'superadmin@example.com' });

    // Check if superadmin exists
    if (!superadmin) {
        Superadmin.createPredefinedSuperadmin()
          .then((predefinedSuperadmin) => {
            console.log('Predefined superadmin created:', predefinedSuperadmin);
          })
          .catch((error) => {
            console.error('Error creating predefined superadmin:', error);
          });
    //   return res.status(404).json({ message: 'Predefined superadmin not found' });
    }

    res.json(superadmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Your route definition
const addAdmin  = async (req, res) => {
    try {
      // Find the user by ID to copy
      const userToCopy = await User.findById(req.params.userId);
  
      if (!userToCopy) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create a new user by copying data from the existing user
      const adminData ={
        name: userToCopy.name,
        email: userToCopy.email,
        password: userToCopy.password, // Update as needed
        isAdmin: true, // Mark the new user as an admin
      };
  
      // Save the new user
      const admin = new Admin(adminData);
    await admin.save();

  
      res.json({ message: 'User copied to admin', user: adminData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
module.exports = { getPredefinedSuperadmin , addAdmin};
