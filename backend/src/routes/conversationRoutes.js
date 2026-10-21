const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const {
  createConversation,
  createPdfConversation,
  getConversations,
  getMessages,
  deleteConversation,
  addMessage,
  renameConversation
} = require("../controllers/conversationController");

router.post("/", authMiddleware, createConversation);

router.post("/pdf",authMiddleware,upload.single("pdf"),createPdfConversation);

router.get("/", authMiddleware, getConversations);

router.get("/:id/messages", authMiddleware, getMessages);

router.delete("/:id", authMiddleware, deleteConversation);

router.post("/:id/messages", authMiddleware, addMessage);

router.put("/:id", authMiddleware, renameConversation);

module.exports = router;