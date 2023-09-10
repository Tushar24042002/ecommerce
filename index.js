const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('./config/config_db'); 
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
app.use(express.json());
app.use(fileUpload());


// Parse JSON request bodies
app.use(bodyParser.json());
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Handle JSON parse errors more gracefully
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  res.status(500).json({ message: 'Internal server error' });
});


app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Import and use the product router
const productRouter = require('./router/product');
app.use('/products', productRouter);

const userRoutes = require('./router/user');
app.use('/users', userRoutes);

const adminRouter = require('./router/admin');

app.use('/admin', adminRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
