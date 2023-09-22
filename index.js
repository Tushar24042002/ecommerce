const express = require('express');
const cors = require('cors');
const port = 8080;
const mongoose = require('./config/config_db');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
const path = require("path");
app.use(express.static('public'));
const { fileURLToPath } = require('url');
const { dirname } = require('path');

// Get the directory name and filename of the current script
// const __filenameImported = fileURLToPath(import.meta.url);
// const __dirnameImported = dirname(__filenameImported);
// Enable CORS for all routes


const __filenameImported = require('path').resolve();
const __dirnameImported = require('path').dirname(__filenameImported);

app.use('/public', express.static(path.join(__dirnameImported, 'public')));



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

// superadmin
const superAdminRouter = require('./router/superAdmin');
app.use('/superAdmin', superAdminRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
