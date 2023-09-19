const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controller/userController');
const authMiddleware = require("../middleware/authMiddleware");
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const BASE_URL = './public/';
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


router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify/:token', userController.verifyEmail);
router.post('/upload-document', authMiddleware ,userController.uploadDocument);
router.get('/users', userController.getAllUsers);
router.get('/logout', userController.logout);
module.exports = router;
