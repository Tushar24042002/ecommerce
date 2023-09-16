const express = require('express');
const router = express.Router();
const superadminController = require('../controller/superAdminController');

// Get the predefined superadmin's details
router.get('/', superadminController.getPredefinedSuperadmin);
router.post('/addAdmin/:userId', superadminController.addAdmin);
module.exports = router;
