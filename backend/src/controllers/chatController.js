const ChatHistory = require("../models/ChatHistory");

// Ask AI (Dummy Version)
exports.askAI = async (req,res)=>{

    try{

        const {question} = req.body;

        if(!question){

            return res.status(400).json({

                success:false,
                message:"Question is required"

            });

        }

        const ai = require("../config/gemini");

        const response = await ai.models.generateContent({

            model:"gemini-2.5-flash",

            contents:question

        });

        const aiResponse = response.text;

        const chat = await ChatHistory.create({

            user:req.user.id,
            question,
            answer:aiResponse

        });

        res.status(201).json({

            success:true,
            chat

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.getHistory = async(req,res)=>{

    try{

        const chats = await ChatHistory.find({

            user:req.user.id

        }).sort({createdAt:-1});

        res.status(200).json({

            success:true,
            chats

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.deleteChat = async(req,res)=>{

    try{

        const chat = await ChatHistory.findOneAndDelete({

            _id:req.params.id,
            user:req.user.id

        });

        if(!chat){

            return res.status(404).json({

                success:false,
                message:"Chat not found"

            });

        }

        res.status(200).json({

            success:true,
            message:"Chat deleted"

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};