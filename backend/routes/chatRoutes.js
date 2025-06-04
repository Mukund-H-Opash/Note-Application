const express = require("express");
const router = express.Router();


const  authMiddleware = require('../middleware/authMiddleware');

router.post("/:id/invite", authMiddleware);


module.exports = router