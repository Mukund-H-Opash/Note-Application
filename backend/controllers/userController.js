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




module.exports = { getallusers, getuserbyid };

