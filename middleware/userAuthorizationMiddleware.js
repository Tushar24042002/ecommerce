// userAuthorizationMiddleware.js

const User = require('../model/User');

const userAuthorizationMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming you have middleware to authenticate users
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    if (!user.isVerifiedByAdmin) {
      return res.status(403).json({ message: 'User not verified by admin' });
    }

    // User is verified by both email and admin, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = userAuthorizationMiddleware;
