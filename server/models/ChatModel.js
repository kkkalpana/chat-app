const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// schema
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  {
    timestamps: true,
  }
);

// create model
const MessageModel = mongoose.model("Message", MessageSchema);
module.exports = MessageModel;
