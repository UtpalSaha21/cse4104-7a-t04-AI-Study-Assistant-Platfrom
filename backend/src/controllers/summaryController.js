const Summary = require("../models/Summary");

// Generate Summary
exports.generateSummary = async(req,res)=>{

    try{

        const {title,inputText}=req.body;

        if(!title || !inputText){

            return res.status(400).json({

                success:false,
                message:"Title and input text are required."

            });

        }

        // Dummy summary
        const generatedSummary =
            "This is a dummy AI summary. It will be replaced with Gemini AI later.";

        const summary = await Summary.create({

            user:req.user.id,

            title,

            inputText,

            generatedSummary

        });

        res.status(201).json({

            success:true,
            summary

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.getSummaryHistory = async(req,res)=>{

    try{

        const summaries = await Summary.find({

            user:req.user.id

        }).sort({createdAt:-1});

        res.status(200).json({

            success:true,
            summaries

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.deleteSummary = async(req,res)=>{

    try{

        const summary = await Summary.findOneAndDelete({

            _id:req.params.id,
            user:req.user.id

        });

        if(!summary){

            return res.status(404).json({

                success:false,
                message:"Summary not found"

            });

        }

        res.status(200).json({

            success:true,
            message:"Summary deleted"

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};