const messageRouter = require("express").Router();
const messageController = require("../controllers/messageController");
const { protect, isAdmin } = require("../middlewares/authorizationMiddleware");

// send message
messageRouter.post("/", protect, messageController.sendMessage);

// get all messages for a group
messageRouter.get("/:groupId", protect, messageController.getAllMessages);
module.exports = messageRouter;
