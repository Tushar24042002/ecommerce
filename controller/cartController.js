// controllers/cartController.js
const Cart = require('../model/Cart');

// Add a product to the user's cart
exports.addToCart = async (req,res) =>{
console.log(res.user.id)
  try {
    const userId = req.user.id;
    const productId = req.body.productId;
    let quantity = req.body.quantity;
   
    let cart = await Cart.findOne({ user: userId });
 
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
   }

    const existingCartItem = cart.items.find((item) =>
      item.product.equals(productId)
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      if(existingCartItem.quantity <= 0){
        cart.items = cart.items.filter(item => item !== existingCartItem);
       
      }
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    throw error;
  }
}
// .populate('items.product')
// Get the user's cart
exports.getCart= async(req,res)=> {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate('items');

    res.status(200).json(cart);

  } catch (error) {
    throw error;
  }
}



// delete item from cart by id
exports.deleteItemByID = async(req,res)=>{
  try{
    const userId = req.user.id;
    const cartElementId = req.body.cartProductId;
    const cart = await Cart.findOne({ user: userId });
    if(!cart){
      res.status(500).json({message : "Cart not found for this User"});
    }

    cart.items = cart.items.filter(item => item._id !== cartElementId);
    console.log(cart);
    res.status(200).json(cart);

  }catch(err){

  }
}
