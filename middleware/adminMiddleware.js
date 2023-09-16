const jwt = require('jsonwebtoken');
const config = require('../config/config_db'); // Import your configuration file
const Admin = require('../model/Admin'); // Import your Admin model
const authMiddleware = async (req, res, next) => {
    // Get the token from the request headers
    const token = req.header('AuthorizationKey');
  // console.log(token);
    // Check if the token is missing
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      // Verify the token using your secret key (defined in your config)
      const decoded = jwt.verify(token, "Tushar2002");
  
      // Find the Admin associated with the token's ID
      const admin = await Admin.findOne({_id : decoded.id});
  
      // Check if the Admin exists
      if (!admin) {
        return res.status(401).json({ message: 'Access denied. Invalid token.' });
      }
  
      // Attach the Admin object to the request for use in protected routes
      req.admin = admin;
      next(); // Move on to the next middleware or route handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Access denied. Invalid token.' });
    }
  };
  
  module.exports = authMiddleware;
  