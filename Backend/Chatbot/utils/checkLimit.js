const ChatUser = require("../models/ChatUser");

async function checkLimit(phone) {
  const today = new Date().toISOString().split("T")[0];
  let user = await ChatUser.findOne({ phone });

  if (!user) {
    await ChatUser.create({ phone, query_count: 1, last_used: today });
    return true;
  }

  if (user.last_used !== today) {
    user.query_count = 1;
    user.last_used = today;
    await user.save();
    return true;
  }

  if (user.query_count >= 15) return false;

  user.query_count += 1;
  await user.save();
  return true;
}

module.exports = checkLimit;