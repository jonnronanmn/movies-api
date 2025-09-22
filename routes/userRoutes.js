const express = require('express');
const router = express.Router(); 
const userController = require("../controllers/userController");
const { verify } = require("../auth");

// User registration
router.post("/register", userController.registerUser);

// User login
router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getUserDetails);

module.exports = router;