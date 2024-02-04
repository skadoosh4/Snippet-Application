const mongoose = require("mongoose");
const { username, password, projectname } = require("../config.json");
const mongoURL = `mongodb+srv://${username}:${password}@cluster0.78j51rt.mongodb.net/?retryWrites=true&w=majority`;
// CONNECT TO MONGO DB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("Successfully connected to Mongo DB");
  } catch (e) {
    console.error(e);
  }
};

module.exports = { connectDB };
