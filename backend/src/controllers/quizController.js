const Quiz = require("../models/Quiz");

// Dummy Quiz Generator
exports.generateQuiz = async(req,res)=>{

    try{

        const {topic,difficulty}=req.body;

        if(!topic){

            return res.status(400).json({
                success:false,
                message:"Topic is required"
            });

        }

        const quiz = await Quiz.create({

            user:req.user.id,

            topic,

            difficulty,

            questions:[

                {
                    question:`What is ${topic}?`,
                    options:[
                        "Option A",
                        "Option B",
                        "Option C",
                        "Option D"
                    ],
                    correctAnswer:"Option A"
                },

                {
                    question:`Which statement about ${topic} is correct?`,
                    options:[
                        "Statement A",
                        "Statement B",
                        "Statement C",
                        "Statement D"
                    ],
                    correctAnswer:"Statement B"
                }

            ]

        });

        res.status(201).json({

            success:true,
            quiz

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.getQuizHistory = async(req,res)=>{

    try{

        const quizzes = await Quiz.find({

            user:req.user.id

        }).sort({createdAt:-1});

        res.status(200).json({

            success:true,
            quizzes

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.deleteQuiz = async(req,res)=>{

    try{

        const quiz = await Quiz.findOneAndDelete({

            _id:req.params.id,
            user:req.user.id

        });

        if(!quiz){

            return res.status(404).json({

                success:false,
                message:"Quiz not found"

            });

        }

        res.status(200).json({

            success:true,
            message:"Quiz deleted"

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};