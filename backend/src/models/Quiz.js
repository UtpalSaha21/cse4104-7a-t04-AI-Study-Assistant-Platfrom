const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({

    question:{
        type:String,
        required:true
    },

    options:{
        type:[String],
        required:true
    },

    correctAnswer:{
        type:String,
        required:true
    }

});

const quizSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    topic:{
        type:String,
        required:true
    },

    difficulty:{
        type:String,
        enum:["Easy","Medium","Hard"],
        default:"Medium"
    },

    questions:[questionSchema]

},{
    timestamps:true
});

module.exports = mongoose.model("Quiz",quizSchema);