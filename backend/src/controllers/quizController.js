const Quiz = require("../models/Quiz");
const ai = require("../config/gemini");

exports.generateQuiz = async (req, res) => {
    try {

        const { topic, difficulty } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "Topic is required"
            });
        }

        const prompt = `
                            Generate 5 multiple choice questions.

                            Topic: ${topic}
                            Difficulty: ${difficulty || "Medium"}

                            Return ONLY a valid JSON array.

                            Example:

                            [
                            {
                                "question": "What is Java?",
                                "options": [
                                "Programming Language",
                                "Operating System",
                                "Browser",
                                "Database"
                                ],
                                "correctAnswer": "Programming Language"
                            }
                            ]
                            `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        let text = response.text;

        // Remove markdown if Gemini returns it
        text = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let questions;

        try {
            questions = JSON.parse(text);
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "AI returned an invalid quiz format. Please try again."
            });
        }

        const quiz = await Quiz.create({

            user: req.user.id,

            topic,

            difficulty: difficulty || "Medium",

            questions

        });

        res.status(201).json({

            success: true,
            quiz

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,
            message: error.message

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