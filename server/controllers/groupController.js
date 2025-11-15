const groupModel = require("../models/GroupModel");

// Create Group
async function createGroup(req, res) {
  const { name, description, admin } = req.body;
  try {
    const newGroup = new groupModel({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    await newGroup.save();

    const populatedGroup = await groupModel
      .findById(newGroup._id)
      .populate("admin", "username email")
      .populate("members", "username email");

    res
      .status(201)
      .json({ message: "Group created successfully", group: populatedGroup });
  } catch (e) {
    res.status(400).json({ message: "Error creating group", error: e.message });
  }
}

// Get All Groups
const getAllGroups = async (req, res) => {
  try {
    const grousp = await groupModel
      .find()
      .populate("admin", "username email")
      .populate("members", "username email");
    res.status(201).json(grousp);
  } catch (e) {
    res
      .status(400)
      .json({ message: "Error fetching groups", error: e.message });
  }
};

// Join Group
const joinGroup = async (req, res) => {
  try {
    const group = await groupModel.findById(req.body.groupId);

    // if group not found
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // if user already a member
    if (group.members.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "User already a member of the group" });
    }

    // add user to group members
    group.members.push(req.user._id);
    await group.save();

    res.status(200).json({ message: "Joined group successfully", group });
  } catch (e) {
    res.status(400).json({ message: "Error joining group", error: e.message });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  joinGroup,
};
