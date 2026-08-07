const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.get("/",(req,res)=>{

    res.send("AI Study Assistant Backend Running");

});

const authRoutes=require("./routes/authRoutes");
const plannerRoutes=require("./routes/plannerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const quizRoutes=require("./routes/quizRoutes");
const summaryRoutes=require("./routes/summaryRoutes");
const taskRoutes = require("./routes/taskRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        message: "Too many authentication attempts. Please try again later."
    }
});

app.use("/api/auth", authLimiter);

app.use("/api/auth",authRoutes);
app.use("/api/planner",plannerRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/quiz",quizRoutes);
app.use("/api/summary",summaryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/conversations", conversationRoutes);

module.exports=app;