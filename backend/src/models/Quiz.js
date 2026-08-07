const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({

    question: {
        type: String,
        required: true
    },

    options: {
        type: [String],
        required: true
    },

    correctAnswer: {
        type: String,
        required: true
    }

});

const quizSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    topic: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium"
    },

    questions: [questionSchema],

    score: {
        type: Number,
        default: null
    },

    totalQuestions: {
        type: Number,
        default: 5
    },

    completed: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Quiz", quizSchema);