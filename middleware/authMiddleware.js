const jwt = require('jsonwebtoken');
const config = require('../config/config_db'); // Import your configuration file
const User = require('../model/User'); // Import your User model
const authMiddleware = async (req, res, next) => {
    const token = req.header('AuthorizationKey');
  // console.log(token);
    // Check if the token is missing
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      // Verify the token using your secret key (defined in your config)
      const decoded = jwt.verify(token, "Tushar2002");
  
      // Find the user associated with the token's ID
      const user = await User.findOne({_id : decoded.id});
  
      // Check if the user exists
      if (!user) {
        return res.status(401).json({ message: 'Access denied. Invalid token.' });
      }
  
      // Attach the user object to the request for use in protected routes
      req.user = user;
      next(); // Move on to the next middleware or route handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Access denied. Invalid token.' });
    }
  };
  
  module.exports = authMiddleware;
  