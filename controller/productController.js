const Product = require('../model/product');
const mongoose = require('mongoose');
const fs = require('fs-extra');



let images; 
exports.createProduct = async (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ message: 'Both "name" and "price" are required fields.' });
    }

    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description || '',
      price: req.body.price,
      category: req.body.category || '',
      images: [], // Initialize images as an empty array
    });

    const savedProduct = await newProduct.save();

    const productFolderName = req.body.name.replace(/ /g, '_'); // Replace spaces with underscores
    const productFolderPath = `./public/products/${productFolderName}`;
    await fs.ensureDir(productFolderPath);

    // Handle image uploads
    if (req.files && req.files.images) {
      let images = req.files.images; // Define images as a variable
      if (!Array.isArray(images)) {
        images = [images];
      }

      // Move each image to the product's folder and update the product's 'images' field with image objects
      const imageObjects = [];
      for (const image of images) {
        const imageId = new mongoose.Types.ObjectId(); // Generate a new image ID
        const imageFileName = `${imageId}_${Date.now()}_${image.name}`;
        await image.mv(`${productFolderPath}/${imageFileName}`);
        const imageUrl = `/products/${productFolderName}/${imageFileName}`;
        imageObjects.push({ id: imageId, url: imageUrl });
      }

      // Update the product's 'images' field with the image objects
      savedProduct.images = imageObjects;
      await savedProduct.save();
    }

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





exports.getAllProducts = async (req, res) => {
  try {
    const filters = {};

    if (req.query.name) {
      filters.name = { $regex: new RegExp(req.query.name, 'i') }; 
    }

    if (req.query.category) {
      filters.category = { $regex: new RegExp(req.query.category, 'i') };
    }
     if (req.query.minPrice) {
      filters.price = { $gte: parseFloat(req.query.minPrice) }; 
    }

    if (req.query.maxPrice) {
      if (!filters.price) filters.price = {}; 
      filters.price.$lte = parseFloat(req.query.maxPrice);
    }

    const sortOptions = {};

    if (req.query.sort) {
      const sortBy = req.query.sort.toLowerCase();

      if (sortBy === 'asc') {
        sortOptions.price = 1; // Ascending order
      } else if (sortBy === 'desc') {
        sortOptions.price = -1; // Descending order
      }
    }

    // Use the 'sort' option to sort the products based on the 'sortOptions'
    const products = await Product.find(filters).sort(sortOptions);



    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// Retrieve a product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.find({_id : productId});

    // Check if the product with the given ID exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// Update an existing product by ID
exports.updateProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body, // The updated product data from the request body
      { new: true } // Return the updated product
    );

    // Check if the product with the given ID exists
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete an existing product by ID
exports.deleteProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const deletedProduct = await Product.findByIdAndRemove(productId);

    // Check if the product with the given ID exists
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





// Delete a product image by image ID
exports.deleteProductImageById = async (req,res)=>{
  try {
    const productId = req.params.productId;
    const imageId = req.params.imageId;

    // Validate that the provided IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ message: 'Invalid product or image ID' });
    }

    const product = await Product.findById(productId);

    // Check if the product with the given ID exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the image to delete by its ID
    const imageToDelete = product.images.find((image) => image.id.toString() === imageId);

    // Check if the image with the given ID exists
    if (!imageToDelete) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete the image file from the server
    const imagePath = `./public${imageToDelete.url}`;
    await fs.remove(imagePath);

    // Remove the image object from the product's 'images' array
    product.images = product.images.filter((image) => image.id.toString() !== imageId);

    // Save the updated product
    await product.save();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

