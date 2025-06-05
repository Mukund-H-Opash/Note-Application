const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const signup = async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;

        if (!username || !email || !password || !roles) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegx.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'User already exists' });
        }
          const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ email, password: hashedPassword, username, roles });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const login =async(req,res) =>{
    try{
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
         return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await User.findOne({ email });
         if (!user) {
            return res.status(400).json({ message:'Invalid credentials' });
         }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "password is incorrect" });
        }

        const token = jwt.sign(
            { userId: user._id, roles: user.roles, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { id: user._id, email: user.email, roles: user.roles, name: user.username  } });

    }catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
     }

};

const me = async (req, res) => {
    try {
        
      const user = await User.findById(req.userId).select('-password');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
    


module.exports = { signup ,login, me };


