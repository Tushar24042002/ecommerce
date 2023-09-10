// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const config = require('../config/config_db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const transporter = nodemailer.createTransport({
  host: 'server5.dnspark.in',
  port: 587,
  auth: {
    user: 'admin@studybuddy.store',
    pass: 'Tushar@2002',
  },
  secure: false, // Set to true if your SMTP server requires secure (TLS/SSL) connections
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Generate a verification token
    const token = crypto.randomBytes(20).toString('hex');
    newUser.verificationToken = token;

    await newUser.save();

    // Send verification email
    const mailOptions = {
      from: 'admin@studybuddy.store',
      to: email,
      subject: 'Account Verification',
      text: `To verify your account, please click the following link:  ${req.protocol}://${req.get('host')}/users/verify/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      console.log(`Email sent: ${info.response}`);
      res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    jwt.sign(payload,  "Tushar2002", { expiresIn: 36000 }, (err, token) => {
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



exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully'})
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};








exports.uploadDocument = async (req, res) => {
  try {
    // Get the logged-in user ID from the authentication token
    const userId = req.user.id;

    // Access the uploaded file via req.file
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the original filename and generate a unique name
    const originalFileName = uploadedFile.originalname;
    const uniqueFileName = `${Date.now()}_${originalFileName}`;

    // Create a document object with name and fileUrl
    const document = {
      name: uniqueFileName,
      fileUrl: `/uploads/${uniqueFileName}`, // Customize the URL path as needed
    };

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the document to the user's documents array
    user.documents.push(document);

    // Save the user document changes
    await user.save();

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
