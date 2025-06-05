const express = require("express");

const { signup, login ,me } = require("../controllers/authController");
const router = express.Router();
const  authMiddleware = require('../middleware/meMiddleware');

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, me)

module.exports = router;

