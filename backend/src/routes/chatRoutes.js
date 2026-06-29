const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

askAI,
getHistory,
deleteChat

}=require("../controllers/chatController");

router.post("/",authMiddleware,askAI);

router.get("/history",authMiddleware,getHistory);

router.delete("/:id",authMiddleware,deleteChat);

module.exports = router;