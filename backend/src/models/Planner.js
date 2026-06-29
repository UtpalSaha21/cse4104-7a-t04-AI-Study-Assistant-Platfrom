const mongoose = require("mongoose");

const plannerSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true,
        trim:true
    },

    description:{
        type:String,
        required:true
    },

    subject:{
        type:String,
        required:true
    },

    deadline:{
        type:Date,
        required:true
    },

    status:{
        type:String,
        enum:["Pending","Completed"],
        default:"Pending"
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Planner",plannerSchema);