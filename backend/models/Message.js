const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: String,
    seen: {
      type: Boolean,
      default: false,
    },
    // 🔥🔥🔥 THIS IS THE FIX
    file: {
      name: { type: String },
      url: { type: String },
      type: { type: String },
      size: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
