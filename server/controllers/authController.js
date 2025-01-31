const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const JWT_SECRET = "your_jwt_secret";

exports.register = async (req, res) => {
  const { name, email, password, role, boardingLocation } = req.body;

  try {
    const userData = { name, email, password, role };
    
    if (role === "parent") {
      if (!boardingLocation) {
        return res.status(400).json({ error: "Boarding location is required for parents" });
      }
      userData.boardingLocation = boardingLocation;
    }

    const user = await User.create(userData);
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ success: true, token,role:user.role,userId:user._id ,boardingLocation:user.boardingLocation});
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
