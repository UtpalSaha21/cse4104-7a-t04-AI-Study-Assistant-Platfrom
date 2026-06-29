const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

createPlanner,
getPlanners,
updatePlanner,
deletePlanner

}=require("../controllers/plannerController");

router.post("/",authMiddleware,createPlanner);

router.get("/",authMiddleware,getPlanners);

router.put("/:id",authMiddleware,updatePlanner);

router.delete("/:id",authMiddleware,deletePlanner);

module.exports = router;