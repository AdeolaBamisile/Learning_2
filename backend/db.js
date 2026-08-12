const mongoose = require("mongoose");

const connectToDatabase = async (url) => {
  console.log("connecting to database", url);

  try {
    await mongoose.connect(url);
    console.log("connected to MongoDB");
  } catch (error) {
    console.log("error connecting to MongoDB", error.message);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
