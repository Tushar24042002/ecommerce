const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  category: String,
  images: [{
    id: {
      type: mongoose.Schema.Types.ObjectId, // Use ObjectId for image IDs
      default: mongoose.Types.ObjectId, // Generate a new ID by default
    },
    url: String, // Store the image URL as a string
  }],
});

// Create and export the Product model based on the schema
module.exports = mongoose.model('Product', productSchema);
