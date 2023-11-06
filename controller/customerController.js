// controllers/customerController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Customer = require('../model/Customer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const otpGenerator = require('otp-generator');
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


exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const customer = await Customer.findOne({ email });

    if (customer) {
      return res.status(400).json({ message: 'customer already exists' });
    }

    const newCustomer = new Customer({
      name,
      email,
      password,
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    newCustomer.password = await bcrypt.hash(password, salt);

    // Generate a verification token
    const token = otpGenerator.generate(6, {digits: true,alphabets: false, specialChars: false });
    // const token = crypto.randomBytes(20).toString('hex');
    newCustomer.verificationToken = token;

    await newCustomer.save();

    // const msg =  `To verify your account, please click the following link:  http://localhost:3000/customer/emailVerification?token=${newCustomer.verificationToken}`;
    const msg =  `To verify your account, please click the following OTP:  ${newCustomer.verificationToken}`;

    // Send verification email
    const mailOptions = {
      from: 'admin@studybuddy.store',
      to: email,
      subject: 'Account Verification',
      text: msg,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      console.log(`Email sent: ${info.response}`);
      res.status(201).json({ success: true, message: 'Customer registered successfully. Please check your email for verification.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ message: 'customer not found' });
    }

    // Check if the user is verified
    if (!customer.isVerified) {
      return res.status(401).json({ message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: customer._id,
      name: customer.name,
      email: customer.email,
    };

    jwt.sign(payload, "Tushar2002", { expiresIn: 36000 }, (err, token) => {
      if (err) throw err;
      res.status(200).json({
        success: true,
        token: `${token}`,
        data: {
          name: customer.name,
          email: customer.email,
        },
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
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: 'Invalid Email' });
    }
    const customer = await Customer.findOne({ verificationToken: token });

    if (!customer) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    if(customer.email != email){
      return res.status(400).json({ message: 'Invalid User or OTP' });
    }

    customer.isVerified = true;
    customer.verificationToken = undefined;
    await customer.save();

    res.status(200).json({ message: 'Email verified successfully' })
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
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
    const customer = await Customer.find();
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Extract the fields you want to update from the request body
    const { isVerified, password, email, ...updateFields } = req.body;

    // Ensure that you don't update isAdmin and isVerified
    const updateCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updateFields },
      { new: true }
    );

    if (!updateCustomer) {
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
    const customerId = req.params.customerId;
    const newPassword = req.body.newPassword;
    console.log(newPassword, customerId);

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt); // 10 is the salt rounds, you can adjust it as needed

    // Update the user's password
    const updateCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updateCustomer) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, status: 200, message: "Password Update Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};





exports.addUpdateCart = async(req,res)=>{
  try{

  }catch(err){

  }
}
