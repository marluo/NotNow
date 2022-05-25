const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    requied: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  Organisation: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  activated: {
    type: Boolean,
    required: true
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = Ad;
