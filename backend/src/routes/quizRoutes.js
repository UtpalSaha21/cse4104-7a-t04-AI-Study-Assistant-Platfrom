const express=require("express");

const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const{

generateQuiz,
generateQuizFromPDF,
getQuizHistory,
deleteQuiz,
getQuiz,
submitQuiz

}=require("../controllers/quizController");

router.post("/generate",authMiddleware,generateQuiz);

router.post("/generate-from-pdf", authMiddleware, upload.single("pdf"), generateQuizFromPDF);

router.get("/history",authMiddleware,getQuizHistory);

router.delete("/:id",authMiddleware,deleteQuiz);

router.get("/:id", authMiddleware, getQuiz);

router.post("/:id/submit", authMiddleware, submitQuiz);

module.exports=router;