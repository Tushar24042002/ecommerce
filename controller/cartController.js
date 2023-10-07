// controllers/cartController.js
const Cart = require('../model/Cart');

// Add a product to the user's cart
exports.addToCart= async (userId, productId, quantity) =>{
  try {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingCartItem = cart.items.find((item) =>
      item.product.equals(productId)
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw error;
  }
}

// Get the user's cart
exports.getCart= async(userId)=> {
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    return cart;
  } catch (error) {
    throw error;
  }
}
