const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

askAI,

}=require("../controllers/chatController");

router.post("/",authMiddleware,askAI);

module.exports = router;