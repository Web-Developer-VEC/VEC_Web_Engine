const mongoose = require("mongoose");

const ChatUserSchema = new mongoose.Schema({
  phone: String,
  query_count: Number,
  last_used: String,
});

module.exports = mongoose.model("ChatUser", ChatUserSchema);