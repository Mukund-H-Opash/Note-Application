const User = require('../models/User');

const rolesMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.some(role => req.user.roles.includes(role))) {
      return res.status(403).json({ message: "Access denied"  });
    }
    next();
  };
};

module.exports = rolesMiddleware;