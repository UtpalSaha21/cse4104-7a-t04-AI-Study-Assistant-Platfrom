const Task = require("../models/Task");

// Create Task
exports.createTask = async (req, res) => {

    try {

        const task = await Task.create({
            text: req.body.text,
            completed: false,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            task
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get All Tasks

exports.getTasks = async (req, res) => {

    try {

        const tasks = await Task.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            tasks
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Update Task

exports.updateTask = async (req, res) => {

    try {

        const task = await Task.findOneAndUpdate(

            {
                _id: req.params.id,
                user: req.user.id
            },

            req.body,

            {
                new: true
            }

        );

        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }

        res.json({
            success: true,
            task
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Delete Task

exports.deleteTask = async (req, res) => {

    try {

        const task = await Task.findOneAndDelete({

            _id: req.params.id,
            user: req.user.id

        });

        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });

        }

        res.json({
            success: true,
            message: "Task deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};