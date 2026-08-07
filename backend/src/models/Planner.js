const mongoose = require("mongoose");

const plannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    day: {
        type: String,
        required: true
    },

    time: {
        type: String,
        required: true
    },

    priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium"
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Planner", plannerSchema);