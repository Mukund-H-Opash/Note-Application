const express =require('express');
const router = express.Router();
const {getallusers, getuserbyid } = require('../controllers/userController');
const  authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');



router.get('/', authMiddleware,roleMiddleware(['Admin']), getallusers);
router.get('/:id', authMiddleware, getuserbyid);


    
module.exports = router



