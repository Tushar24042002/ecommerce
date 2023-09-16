// routers/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');



// Route to create a new admin
router.post('/create', adminController.createAdmin);
router.post('/login', adminController.login);
// Route to update an existing admin
router.put('/:id', adminController.updateAdmin);

// Route to list all admins
router.get('/', adminController.listAdmins);

// Add more admin routes as needed

// Protect the route with authentication and admin middleware
router.post('/verify-document/:userId/:documentId', adminMiddleware, adminController.verifyDocument);

module.exports = router;
// adminRoutes.js



