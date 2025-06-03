const express = require("express");
const router = express.Router();
const {inviteCollaborator} = require('../controllers/chatController');

const  authMiddleware = require('../middleware/authMiddleware');

router.post("/:id/invite", authMiddleware, inviteCollaborator);


module.exports = router