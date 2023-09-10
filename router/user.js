// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controller/userController');
const authMiddleware = require("../middleware/authMiddleware");
const multer = require('multer');

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/verify/:token', userController.verifyEmail);
router.post('/upload-document', authMiddleware, upload.single('file'),userController.uploadDocument);
router.get('/users', userController.getAllUsers);
module.exports = router;
