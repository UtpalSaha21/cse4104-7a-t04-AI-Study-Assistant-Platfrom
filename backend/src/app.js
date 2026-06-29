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

app.use("/api/auth",authRoutes);
app.use("/api/planner",plannerRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/quiz",quizRoutes);

module.exports=app;