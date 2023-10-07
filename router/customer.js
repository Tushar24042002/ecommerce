const express = require('express');
const router = express.Router();
const passport = require('passport');
const customerController = require('../controller/customerController');


router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.post('/verify/:token', customerController.verifyEmail);
router.get('/customers', customerController.getAllUsers);
router.put('/customers/:customerId',customerController.updateUser);
router.put('/customers/updatePassword/:customerId',customerController.updateUserPassword);

router.get('/logout', customerController.logout);
module.exports = router;