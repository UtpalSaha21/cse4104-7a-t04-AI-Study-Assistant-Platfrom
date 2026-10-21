const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    title:{
        type:String,
        required:true
    },

    category:String,

    summary:String,

    keyPoints:[String],

    context:String,

    fileName:String
},
{
    timestamps:true
});

module.exports = mongoose.model("Summary", summarySchema);