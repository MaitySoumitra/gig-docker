const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controller/chatRequestController");

router.post("/send", protect, controller.sendRequest);
router.get("/incoming", protect, controller.getIncomingRequests);
router.post("/accept/:id", protect, controller.acceptRequest);
router.post("/reject/:id", protect, controller.rejectRequest);

module.exports = router;
