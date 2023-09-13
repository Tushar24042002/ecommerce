// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const config = require('../config/config_db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const transporter = nodemailer.createTransport({
  host: 'server5.dnspark.in',
  port: 587,
  auth: {
    user: 'admin@studybuddy.store',
    pass: 'Tushar@2002',
  },
  secure: false, // Set to true if your SMTP server requires secure (TLS/SSL) connections
});




const { validationResult } = require('express-validator');
const { use } = require('passport');

const BASE_URL = './public';
const usersDocumentsPath = `${BASE_URL}/usersDocuments/`;

// Create the destination directory if it doesn't exist
if (!fs.existsSync(usersDocumentsPath)) {
  fs.mkdirSync(usersDocumentsPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, usersDocumentsPath);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });














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

    res.status(200).json({ message: 'Email verified successfully' })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};











exports.uploadDocument = async (req, res) => {

  try {
    const userId = req.user.id;

    // Validate that the provided ID is a valid MongoDB ObjectId
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ message: 'Invalid product ID' });
    // }

    const user = await User.findById(userId);

    // Check if the user with the given ID exists
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    // Define the folder name for the user based on its name
    const userFolderName = user.name.replace(/ /g, '_'); // Replace spaces with underscores
    const userFolderPath = `./public/usersDocuments/${userFolderName}`;
    await fs.ensureDir(userFolderPath);

    // Handle adding product images
    if (req.files && req.files.images) {
      let images = req.files.images; // Define images as a variable
      if (!Array.isArray(images)) {
        images = [images];
      }

      // Process and add each image to the product's 'images' array
      for (const image of images) {
        const imageId = new mongoose.Types.ObjectId(); 
        const imageFileName = `${imageId}_${Date.now()}_${image.name}`;
        const imageUrl = `/products/${userFolderName}/${imageFileName}`;
        
        // Move the image to the product's folder and save it
        await image.mv(`${userFolderPath}/${imageFileName}`);

        // Create an image object and add it to the product's 'images' array
        const imageObject = {
          id: imageId,
          url: imageUrl,
        };
        user.documents.push(imageObject);
      }

      // Save the updated product with the new images
      await user.save();

      res.status(201).json({ message: 'Images added to product successfully', user});
    } else {
      return res.status(400).json({ message: 'No images uploaded' });
    }
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
