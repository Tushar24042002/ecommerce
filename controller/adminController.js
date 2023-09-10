const mongoose = require('mongoose');
const Admin = require('../model/Admin');

exports.createAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = new Admin({ name, email });

    await admin.save();
    res.status(201).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const admin = await Admin.findByIdAndUpdate(id, { name, email }, { new: true });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Implement more controller functions as needed for admin-related actions
// controllers/AdminController.js


exports.verifyDocument = async (req, res) => {
  try {
    // Ensure that the logged-in user is an admin (you may have a different way to check this)
    const isAdmin = req.user.isAdmin;

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin users can verify documents' });
    }

    // Get the userId and documentId from the request parameters
    const { userId, documentId } = req.params;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the document by documentId in the user's documents array
    const document = user.documents.id(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Mark the document as verified
    document.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Document verified by admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
