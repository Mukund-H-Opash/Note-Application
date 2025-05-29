const auth = require("../models/User");
const  jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "all fields are required" });
        }

        const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegx.test(email)) {
            return res.status(400).json({ message:'please provide valid email address'});
        }

        if (password.length < 6) {
        return res.status(400).json({ message: 'password at least 6 characters long' })
        }

        const existingemail = await User.findOne({email});
        if (existingemail) return res.status(400).json({message:'User already exists'});

        const User = await User.create({email,password,name,role});
        res.status(201).json({message:'User register sucessfully'}) 
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
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
         if (!user) return res.status(400).json({ message:'Invalid credentials' });

        if (user.isBlocked) {
         return res.status(403).json({ message: 'User is blocked' });
        }

        const isMatch = await user.comparePassword(password);
         if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!process.env.JWT_SECRET) {
         return res.status(500).json({ message: 'JWT secret not configured' });
         }

         const token = jwt.sign(
               { userId: user._id, role: user.role },
               process.env.JWT_SECRET,
               { expiresIn: '24h' }
             );
         
             res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.username  } });

    }catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
     }

};
    


module.exports = { signup ,login};
 

