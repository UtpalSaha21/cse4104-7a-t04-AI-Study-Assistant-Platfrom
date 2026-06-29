const Planner = require("../models/Planner");

// Create Planner
exports.createPlanner = async (req,res)=>{

    try{

        const planner = await Planner.create({

            ...req.body,
            user:req.user.id

        });

        res.status(201).json({

            success:true,
            planner

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.getPlanners = async(req,res)=>{

    try{

        const planners = await Planner.find({

            user:req.user.id

        });

        res.status(200).json({

            success:true,
            planners

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.updatePlanner = async(req,res)=>{

    try{

        const planner = await Planner.findOneAndUpdate(

            {

                _id:req.params.id,
                user:req.user.id

            },

            req.body,

            {

                new:true

            }

        );

        if(!planner){

            return res.status(404).json({

                success:false,
                message:"Planner not found"

            });

        }

        res.status(200).json({

            success:true,
            planner

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.deletePlanner = async(req,res)=>{

    try{

        const planner = await Planner.findOneAndDelete({

            _id:req.params.id,
            user:req.user.id

        });

        if(!planner){

            return res.status(404).json({

                success:false,
                message:"Planner not found"

            });

        }

        res.status(200).json({

            success:true,
            message:"Planner deleted"

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};