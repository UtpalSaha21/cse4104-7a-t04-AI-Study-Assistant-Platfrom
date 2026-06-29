const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    title:{
        type:String,
        required:true
    },

    inputText:{
        type:String,
        required:true
    },

    generatedSummary:{
        type:String,
        required:true
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Summary",summarySchema);