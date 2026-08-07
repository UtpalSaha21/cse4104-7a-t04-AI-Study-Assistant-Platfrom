const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Chat",
    },

    type: {
      type: String,
      enum: ["normal", "pdf"],
      default: "normal",
    },

    fileName: {
      type: String,
      default: null,
    },

    fileUri: {
      type: String,
      default: null,
    },

    geminiFileName: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);