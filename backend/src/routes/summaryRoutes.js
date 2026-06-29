const express=require("express");

const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");

const{

generateSummary,
getSummaryHistory,
deleteSummary

}=require("../controllers/summaryController");

router.post("/",authMiddleware,generateSummary);

router.get("/history",authMiddleware,getSummaryHistory);

router.delete("/:id",authMiddleware,deleteSummary);

module.exports=router;