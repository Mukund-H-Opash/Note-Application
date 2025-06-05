const jwt = require('jsonwebtoken');
const User = require('../models/User');

const meMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure the decoded token has the correct field (e.g., userId or id)
    const userId = decoded.userId || decoded.id; // Adjust based on your token's payload
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token: User not found' });
    }

    req.user = user; // Set the user object
    req.userId = userId; // Explicitly set req.userId for the me controller
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = meMiddleware;