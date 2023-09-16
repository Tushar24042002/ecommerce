const mongoose = require('mongoose');
const Admin = require('../model/Admin');
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
// Import your User model


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'admin not found' });
    }

    // Check if the user is verified
    if (admin.isAdmin == false) {
      return res.status(401).json({ message: 'admin not verified' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    };

    jwt.sign(payload, "Tushar2002", { expiresIn: 36000 }, (err, token) => {
      if (err) throw err;
      res.status(200).json({
        success: true,
        token: `Bearer ${token}`,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.verifyDocument = async (req, res) => {
  try {
    // Ensure that the logged-in user is an admin (you may have a different way to check this)
    const isAdmin = req.admin.isAdmin;

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
