const express = require('express');
const router = express.Router();
const passport = require('passport');
const cartController = require('../controller/cartController');


router.post('/addToCart', cartController.addToCart);
router.get('/cartProdcuts',cartController.getCart);
module.exports = router;