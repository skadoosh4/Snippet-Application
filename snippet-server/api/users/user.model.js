const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    password: { type: String, required: true },
    years_experience: Number,
    programming_languages: [String],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

UserSchema.virtual("snippets", {
  ref: "Snippet",
  localField: "_id",
  foreignField: "user_id",
});

UserSchema.virtual("bookmarks", {
  ref: "Bookmark",
  localField: "_id",
  foreignField: "user_id",
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const { _id } = this.getQuery();

  const { username } = this.getUpdate();

  if (username) {
    const user = await User.findOne({
      username: { $regex: `\\b${username}\\b`, $option: "i" },
    });

    if (user && user._id.toString() !== _id) {
      const error = new Error(`Username ${username} is already taken.`);
      return next(error);
    }
  }
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
