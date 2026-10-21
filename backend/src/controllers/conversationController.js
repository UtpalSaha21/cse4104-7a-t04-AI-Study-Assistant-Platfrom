const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { uploadPdf } = require("../services/geminiFile");
const fs = require("fs");
const path = require("path");

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {

    const {
      title,
      type,
      fileName,
      fileUri,
      geminiFileName
    } = req.body;

    const conversation = await Conversation.create({
      user: req.user.id,
      title: title || "New Chat",
      type: type || "normal",
      fileName: fileName || null,
      fileUri: fileUri || null,
      geminiFileName: geminiFileName || null
    });

    res.status(201).json({
      success: true,
      conversation
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.createPdfConversation = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please upload a PDF."
        });
    }

    const uploadedFile = await uploadPdf(req.file.path);

    let conversation;

    // Existing conversation → attach PDF
    if (req.body.conversationId) {

        conversation = await Conversation.findOneAndUpdate(

            {
                _id: req.body.conversationId,
                user: req.user.id
            },

            {
                type: "pdf",
                title: req.file.originalname,
                fileName: req.file.originalname,
                fileUri: uploadedFile.uri,
                geminiFileName: uploadedFile.name
            },

            {
                new: true
            }

        );

    }

    // No conversation → create one
    else {

        conversation = await Conversation.create({

            user: req.user.id,

            title: req.file.originalname,

            type: "pdf",

            fileName: req.file.originalname,

            fileUri: uploadedFile.uri,

            geminiFileName: uploadedFile.name

        });

    }

    res.status(201).json({

        success: true,

        conversation

    });

    await Message.create({
    conversation: conversation._id,
    role: "system",
    content: `📄 ${req.file.originalname} uploaded successfully.\nYou can now ask questions about this document.`
});

};

// Get all conversations
exports.getConversations = async (req, res) => {
  try {

    const conversations = await Conversation.find({
      user: req.user.id
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get messages of one conversation
exports.getMessages = async (req, res) => {
  try {

    const conversation = await Conversation.findById(req.params.id);

    const messages = await Message.find({
      conversation: req.params.id
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      conversation,
      messages
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {

    await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    await Message.deleteMany({
      conversation: req.params.id
    });

    res.status(200).json({
      success: true,
      message: "Conversation deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.addMessage = async (req, res) => {
  try {

    const { role, content } = req.body;

    const message = await Message.create({
      conversation: req.params.id,
      role,
      content
    });

    await Conversation.findByIdAndUpdate(
      req.params.id,
      { updatedAt: Date.now() }
    );

    res.status(201).json({
      success: true,
      message
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.renameConversation = async (req, res) => {

  try {

    const conversation = await Conversation.findOneAndUpdate(

      {
        _id: req.params.id,
        user: req.user.id
      },

      {
        title: req.body.title
      },

      {
        new: true
      }

    );

    if (!conversation) {

      return res.status(404).json({

        success: false,
        message: "Conversation not found"

      });

    }

    res.status(200).json({

      success: true,
      conversation

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};