const jwt = require('jsonwebtoken');
   const User = require('../models/User');

   const authMiddleware = async (req, res, next) => {

     const token = req.header('Authorization')?.replace('Bearer ', '');
     
     if (!token) return res.status(401).json({ message: 'No token provided' });

     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const user = await User.findById(decoded.userId);
       if (!user) return res.status(401).json({ message: 'Invalid token' });

       req.user = user;
       next();
     } catch (error) {
       res.status(401).json({ message: 'Unauthorized' });
       console.log(error);
     }
   };

   const roleMiddleware = (roles) => (req, res, next) => {
     if (!roles.includes(req.user.role)) {
       return res.status(403).json({ message: 'Forbidden' });
     }
     next();
   };

   module.exports = { authMiddleware, roleMiddleware };