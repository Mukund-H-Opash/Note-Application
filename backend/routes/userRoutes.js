// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const {getallusers, getuserbyid } = require("../controllers/userController");

router.get('/', authMiddleware, getallusers);
router.get('/:id', authMiddleware, getuserbyid);

module.exports = router;