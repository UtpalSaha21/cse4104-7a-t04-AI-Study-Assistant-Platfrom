const express = require("express");

const app = express();

app.use(express.json());

app.get("/",(req,res)=>{

    res.send("AI Study Assistant Backend Running");

});

const authRoutes=require("./routes/authRoutes");

app.use("/api/auth",authRoutes);

module.exports=app;