  const inviteCollaborator = async (req, res) => {
    const { id: noteId } = req.params;
    const { userIdToInvite } = req.body;
    const userId = req.user.id; 
    try {
      const note = await Note.findById(noteId);
      if (!note) return res.status(404).json({ message: 'Note not found' });

      if (note.userId.toString() !== userId)
        return res.status(403).json({ message: 'Only the owner can invite collaborators' });

      if (!note.collaborators.includes(userIdToInvite)) {
        note.collaborators.push(userIdToInvite);
        await note.save();
      }

      res.status(200).json({ message: 'User invited successfully', note });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  module.exports = { inviteCollaborator };