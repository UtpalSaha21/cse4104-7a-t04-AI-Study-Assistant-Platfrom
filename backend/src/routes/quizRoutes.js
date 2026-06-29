const express=require("express");

const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");

const{

generateQuiz,
getQuizHistory,
deleteQuiz

}=require("../controllers/quizController");

router.post("/generate",authMiddleware,generateQuiz);

router.get("/history",authMiddleware,getQuizHistory);

router.delete("/:id",authMiddleware,deleteQuiz);

module.exports=router;