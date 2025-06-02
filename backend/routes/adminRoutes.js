const express =require('express');
const router = express.Router();
const {getallusers, getuserbyid ,  getAllUsersWithNotes} = require('../controllers/userController');
const  authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');



router.get('/', authMiddleware,roleMiddleware(['admin']), getallusers);
router.get('/:id', authMiddleware,roleMiddleware(['admin']), getuserbyid);
router.get('/notes', authMiddleware, getAllUsersWithNotes);
    
module.exports = router



