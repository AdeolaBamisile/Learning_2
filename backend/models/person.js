const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  phone: {
    type: String,
    minLength: 5,
  },
  city: {
    type: String,
    required: true,
    minLength: 5,
  },
  street: {
    type: String,
    required: true,
    minLength: 5,
  },
  friendOf: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Person", personSchema);
