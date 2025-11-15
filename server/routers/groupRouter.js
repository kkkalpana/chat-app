const express = require("express");
const groupRouter = express.Router();
const { protect, isAdmin } = require("../middlewares/authorizationMiddleware");

const obj = require("../controllers/groupController");

// Create Group
groupRouter.post("/", protect, isAdmin, obj.createGroup);

//get all groups
groupRouter.get("/", protect, obj.getAllGroups);

// Join Group
groupRouter.post("/join", protect, obj.joinGroup);
// groupRouter.post("/add-member", obj.addMember);
// groupRouter.post("/remove-member", obj.removeMember);
// groupRouter.get("/get-group/:groupId", obj.getGroupDetails);

module.exports = groupRouter;
