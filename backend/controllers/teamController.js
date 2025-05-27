const Team = require('../models/Team');
   const User = require('../models/User');

   const createTeam = async (req, res) => {
     const { name, description, members } = req.body;
     try {
       const team = await Team.create({ name, description, members });
       await User.updateMany({ _id: { $in: members } }, { team: team._id });
       res.status(201).json(team);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const getTeams = async (req, res) => {
     try {
       const teams = await Team.find().populate('members', 'name email');
       res.json(teams);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const getTeamById = async (req, res) => {
     try {
       const team = await Team.findById(req.params.id).populate('members', 'name email');
       if (!team) return res.status(404).json({ message: 'Team not found' });
       res.json(team);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const updateTeam = async (req, res) => {
     const { name, members ,description } = req.body;
     try {
       const team = await Team.findById(req.params.id);
       if (!team) return res.status(404).json({ message: 'Team not found' });

       team.name = name || team.name;
       team.description = description || team.description;
       if (members) {
         team.members = members;
         await User.updateMany({ _id: { $in: members } }, { team: team._id });
         await User.updateMany({ team: team._id, _id: { $nin: members } }, { $unset: { team: 1 } });
       }

       await team.save();
       res.json(team);
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const deleteTeam = async (req, res) => {
     try {
       const team = await Team.findById(req.params.id);
       if (!team) return res.status(404).json({ message: 'Team not found' });

       await User.updateMany({ team: team._id }, { $unset: { team: 1 } });
       await team.deleteOne();
       res.json({ message: 'Team deleted' });
     } catch (error) {
       res.status(500).json({ message: 'Server error', error });
     }
   };

   module.exports = { createTeam, getTeams, getTeamById, updateTeam, deleteTeam };