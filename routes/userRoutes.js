const express = require('express');
const router = express.Router(); 
const userController = require("../controllers/userController");
const { verify } = require("../auth");

// User registration
router.post("/register", userController.registerUser);

// User login
router.post("/login", userController.loginUser);

// You can add more routes later, e.g. get profile, update password, etc.

module.exports = router;