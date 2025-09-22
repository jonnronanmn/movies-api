const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Register
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send({ message: "Email and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).send({ message: "Email already registered" });

    if (password.length < 8)
      return res.status(400).send({ message: "Password must be atleast 8 characters long" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).send({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: "No Email Found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "1d" });

    res.status(200).send({ access: token }); // ✅ send 'access' token
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id; // from verify middleware
    const user = await User.findById(userId).select("_id email isAdmin");

    if (!user) return res.status(404).send({ error: "User not found" });

    res.status(200).send({ user }); // ✅ send user object
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};