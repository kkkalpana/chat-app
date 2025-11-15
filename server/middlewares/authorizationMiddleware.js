const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const protect = async (req, res, next) => {
  // get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // split token from Bearer
      token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); //id, issue ad, expiry
      req.user = await UserModel.findById(decodedToken.id).select("-password");
      next();
    } catch (e) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Access denied, admin only" });
    }
  } catch (e) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = { protect, isAdmin };
