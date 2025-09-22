const User = require('../models/User');
const bcrypt = require('bcrypt');
const { errorHandler } = require('../errorHandler');
const auth = require('../auth');

// Register a new user
module.exports.registerUser = (req, res) => {
    const { email, password } = req.body;

    // Validate email format
    if (!email.includes("@")) {
        return res.status(400).send({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
        return res.status(400).send({ message: 'Password must be atleast 8 characters long' });
    }

    // Create new user
    const newUser = new User({
        email,
        password: bcrypt.hashSync(password, 10)
    });

    newUser.save()
        .then(() => res.status(201).send({ message: 'Registered successfully' }))
        .catch(error => errorHandler(error, req, res));
};

// Login user
module.exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    // Validate email format
    if (!email.includes("@")) {
        return res.status(400).send({ message: 'Invalid email format' });
    }

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: 'No email found' });
            }

            const isPasswordCorrect = bcrypt.compareSync(password, user.password);

            if (!isPasswordCorrect) {
                return res.status(401).send({ message: 'Incorrect email or password' });
            }

            // Success: return access token
            return res.status(200).send({ access: auth.createAccessToken(user) });
        })
        .catch(error => errorHandler(error, req, res));
};

// Get logged-in user details
module.exports.getUserDetails = (req, res) => {
    User.findById(req.user.id)
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }
            user.password = undefined; // don't expose password
            res.status(200).send({ user });
        })
        .catch(error => errorHandler(error, req, res));
};