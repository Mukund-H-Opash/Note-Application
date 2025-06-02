const user = require("../models/User");
const Note = require("../models/Note");

const getallusers = async (req, res) => {
    try {
        const users = await user.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const getuserbyid = async (req, res) => {
    try {
        const user = await user.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAllUsersWithNotes = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); 

    const results = await Promise.all(
      users.map(async (user) => {
        const notes = await Note.find({ owner: user._id });
        return {
          user,
          notes,
        };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




module.exports = { getallusers, getuserbyid ,  getAllUsersWithNotes};

