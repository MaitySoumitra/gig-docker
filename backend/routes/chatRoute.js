const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

/* 📩 SEND MESSAGE */
router.post(
  "/message",
  protect,
  upload.single("file"),
  chatController.sendMessage
);

/* 🔍 SEARCH USERS */
router.get("/search", protect, chatController.searchUsers);

/* 💬 ACCESS CHAT */
router.post("/access", protect, chatController.accessChat);

/* 📜 GET MESSAGES */
router.get("/messages/:id", protect, chatController.getMessages);

/* 📌 GET MY CHATS + UNREAD COUNT */
router.get("/my-chats", protect, chatController.getMyChats);

/* 👀 MARK MESSAGES AS SEEN (🔥 FIXED) */
router.put(
  "/seen/:conversationId",
  protect,
  chatController.markMessagesSeen
);

module.exports = router;
