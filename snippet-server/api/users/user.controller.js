const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./user.model");

const config = require("../../config.json");

const registerUser = async (req, res) => {
  const { body } = req;
  const { username, password } = body;

  if (!password || !username) {
    return res
      .status(400)
      .json({ error: "Username and Password are required" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const userDoc = new User({ ...body, password: hashed });
    const saved = await userDoc.save();

    const user = saved.toObject();
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const authenticated = await bcrypt.compare(password, user.password);

    if (authenticated) {
      const token = jwt.sign(
        { id: user._id, username: user.username },
        config.jwtsecret,
        { expiresIn: "24h" }
      );
      const authorized = user.toObject();
      delete authorized.password;

      res.header("Authorization", `Bearer ${token}`).json(authorized);
    } else {
      res.status(401).json({ error: "Invalid Credentials" });
    }
  } catch {
    res.status(500).json({ error: error.toString() });
  }
};

const getUserById = async (req, res) => {
  const { params, query } = req;
  const id = params.id;

  const includeSnippets = query.snippets === "true";
  const includeBookmarks = query.bookmarks === "true";

  try {
    const virtuals = [];

    if (includeSnippets) {
      virtuals.push("snippets");
    }

    if (includeBookmarks) {
      virtuals.push("bookmarks");
    }

    const user = await User.findOne({ _id: id })
      .populate(virtuals)
      .select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: `No user found by id: ${id}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const updateUser = async (req, res) => {
  const { params, body } = req;
  const id = params.id;

  const { password, ...updateData } = body;

  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true, fields: { password: 0 } }
    );

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: `No User found by id: ${id}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
};
