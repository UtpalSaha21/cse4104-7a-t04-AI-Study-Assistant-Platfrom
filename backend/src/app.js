const express = require("express");

const app = express();

app.use(express.json());

app.get("/",(req,res)=>{

    res.send("AI Study Assistant Backend Running");

});

const authRoutes=require("./routes/authRoutes");
const plannerRoutes=require("./routes/plannerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const quizRoutes=require("./routes/quizRoutes");
const summaryRoutes=require("./routes/summaryRoutes");

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);

app.use("/api/auth",authRoutes);
app.use("/api/planner",plannerRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/quiz",quizRoutes);
app.use("/api/summary",summaryRoutes);

module.exports=app;