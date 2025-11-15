const messageModel = require("../models/ChatModel");

const sendMessage = async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const newMessage = await messageModel.create({
      content,
      group: groupId,
      sender: req.user._id,
    });

    const populatedMessage = await newMessage.populate(
      "sender",
      "username email"
    );
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: "Server Error", error: error.message });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await messageModel
      .find({ group: req.params.groupId })
      .populate("sender", "username email")
      .sort({ createdAt: -1 });
    res.status(201).json(messages);
  } catch (error) {
    res.status(400).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getAllMessages,
};
