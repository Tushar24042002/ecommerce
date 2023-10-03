// controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
      text: `To verify your account, please click the following link:  http://localhost:3000/emailVerification?token=${newUser.verificationToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      console.log(`Email sent: ${info.response}`);
      res.status(201).json({ success: true, message: 'User registered successfully. Please check your email for verification.' });
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
        token: `${token}`,
        data: {
          name: user.name,
          email: user.email,
        },
        userType: user.isAdmin
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
    const user = await User.findById(userId);

    // Check if the user with the given ID exists
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    // Define the folder name for the user based on its name
    const userFolderName = user.name.replace(/ /g, '_'); // Replace spaces with underscores
    const userFolderPath = `./public/usersDocuments/${userFolderName}`;
    await fs.ensureDir(userFolderPath);

    // Handle adding user images
    if (req.files && req.files.images) {
      let images = req.files.images; // Define images as a variable
      if (!Array.isArray(images)) {
        images = [images];
      }

      // Process and add each image to the user's 'images' array
      for (const image of images) {
        const imageId = new mongoose.Types.ObjectId();
        const imageFileName = `${imageId}_${Date.now()}_${image.name}`;
        const imageUrl = `/usersDocuments/${userFolderName}/${imageFileName}`;

        // Move the image to the user's folder and save it
        await image.mv(`${userFolderPath}/${imageFileName}`);

        // Create an image object and add it to the user's 'images' array
        const imageObject = {
          id: imageId,
          url: imageUrl,
        };
        user.documents.push(imageObject);
      }

      // Save the updated product with the new images
      await user.save();

      res.status(201).json({ success: true, message: 'Images added to user successfully', user });
    } else {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// Delete a product image by image ID
exports.deleteDocumentById = async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Check if the user with the given ID exists
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    // Validate that the provided IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(documentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid document id  or user ID' });
    }
    // Find the image to delete by its ID
    const imageToDelete = user.documents.find((image) => image.id.toString() === documentId);

    // Check if the image with the given ID exists
    if (!imageToDelete) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Delete the image file from the server
    const imagePath = `./public${imageToDelete.url}`;
    await fs.remove(imagePath);

    // Remove the image object from the product's 'images' array
    user.documents = user.documents.filter((image) => image.id.toString() !== documentId);

    // Save the updated product
    await user.save();

    res.status(200).json({ success: true, status: 200, message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




exports.logout = async (req, res) => {
  console.log(res);
  try {
    res.clearCookie('AuthorizationKey'); // For cookies
    // localStorage.setItem('isLoggedIn', 'false');
    res.status(201).json({ message: 'logged out successfully', success: true });
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


exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Extract the fields you want to update from the request body
    const { isAdmin, isVerified, isVerifiedByAdmin, password, email, ...updateFields } = req.body;

    // Ensure that you don't update isAdmin and isVerified
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, status: 200, data: updateFields, message: "Update Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




exports.updateUserPassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newPassword = req.body.newPassword;
    console.log(newPassword, userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt); // 10 is the salt rounds, you can adjust it as needed

    // Update the user's password
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updateUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, status: 200, message: "Password Update Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




exports.getUserById = async (req, res) => {
  console.log(req.params.userId);
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    // Ensure that you don't update isAdmin and isVerified
    const user = await User.findOne({_id : userId});

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, status: 200, data: user, message: "User Data Found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getUserByEmail = async (req, res) => {
  console.log(req.params.email);
  try {
    const userEmail = req.params.email;

    // Ensure that you don't update isAdmin and isVerified
    const user = await User.findOne({email : userEmail});

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, status: 200, data: user, message: "User Data Found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



