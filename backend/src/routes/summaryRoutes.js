const express=require("express");

const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const{

generateSummary,
generateSummaryFromPDF,
getSummaryHistory,
deleteSummary

}=require("../controllers/summaryController");

router.post("/",authMiddleware,generateSummary);

router.post("/summary-from-pdf",authMiddleware,upload.single("pdf"),generateSummaryFromPDF);

router.get("/history",authMiddleware,getSummaryHistory);

router.delete("/:id",authMiddleware,deleteSummary);

module.exports=router;