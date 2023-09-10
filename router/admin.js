// routers/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authMiddleware = require('../middleware/authMiddleware');


// Route to create a new admin
router.post('/create', adminController.createAdmin);

// Route to update an existing admin
router.put('/:id', adminController.updateAdmin);

// Route to list all admins
router.get('/', adminController.listAdmins);

// Add more admin routes as needed

// Protect the route with authentication and admin middleware
router.post('/verify-document/:userId/:documentId', authMiddleware, adminController.verifyDocument);

module.exports = router;
// adminRoutes.js



