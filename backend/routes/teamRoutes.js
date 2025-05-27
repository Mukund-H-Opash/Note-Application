const express = require('express');
   const { createTeam, getTeams, getTeamById, updateTeam, deleteTeam } = require('../controllers/teamController');
   const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
   const router = express.Router();

   router.use(authMiddleware);

   router.post('/', roleMiddleware(['admin']), createTeam);
   router.get('/', roleMiddleware(['admin']), getTeams);
   router.get('/:id', roleMiddleware(['admin']), getTeamById);
   router.patch('/:id', roleMiddleware(['admin']), updateTeam);
   router.delete('/:id', roleMiddleware(['admin']), deleteTeam);

   module.exports = router;