const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");

function registerUser(req, res) {
  UserModel.findOne({ email: req.body.email })
    .then((doc) => {
      if (doc != null) {
        return res.status(400).json({ message: "User already exists" });
      }

      // create new user
      const user = new UserModel(req.body);
      user.save().then((doc) => {
        if (doc) {
          res.status(201).json({
            _id: doc._id,
            username: doc.username,
            email: doc.email,
          });
        }
      });
    })
    .catch((e) => {
      res.status(400).json({ message: e.message });
    });
}

//login User

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  await UserModel.findOne({ email })
    .then(async (doc) => {
      if (doc && (await doc.comparePassword(password))) {
        res.json({
          doc: {
            _id: doc._id,
            username: doc.username,
            email: doc.email,
            isAdmin: doc.isAdmin,
            token: generateToken(doc._id),
          },
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    })
    .catch((e) => {
      console.error("Login error:", e);
      res.status(400).json({ message: e.message });
    });
};

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
};
