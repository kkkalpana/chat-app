const express = require("express");
const userRouter = express.Router();
const obj = require("../controllers/userController");

// Register user
userRouter.post("/register", obj.registerUser);

// Login
userRouter.post("/login", obj.loginUser);

module.exports = userRouter;
