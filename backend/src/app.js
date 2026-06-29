const express = require("express");

const app = express();

app.use(express.json());

app.get("/",(req,res)=>{

    res.send("AI Study Assistant Backend Running");

});

const authRoutes=require("./routes/authRoutes");
const plannerRoutes=require("./routes/plannerRoutes");

app.use("/api/auth",authRoutes);
app.use("/api/planner",plannerRoutes);

module.exports=app;