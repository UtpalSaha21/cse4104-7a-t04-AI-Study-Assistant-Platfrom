const Quiz = require("../models/Quiz");
const ai = require("../config/gemini");
const { uploadPdf } = require("../services/geminiFile");

exports.generateQuiz = async (req, res) => {
    try {

        const { topic, difficulty, count } = req.body;

        const allowedCounts = [5, 10, 15, 20];

        const questionCount = allowedCounts.includes(Number(count))
            ? Number(count)
            : 5;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "Topic is required"
            });
        }

        const prompt = `
                            Generate ${questionCount} multiple choice questions.

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

exports.generateQuizFromPDF = async (req, res) => {
    try {

        const { difficulty, count } = req.body;

        const questionCount = Number(count) || 5;

        const uploadedFile = await uploadPdf(req.file.path);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    fileData: {
                        mimeType: "application/pdf",
                        fileUri: uploadedFile.uri
                    }
                },
                {
                    text: `
                            Generate ${questionCount} multiple choice questions.

                            Difficulty: ${difficulty || "Medium"}

                            Return ONLY JSON.

                            [
                            {
                            "question":"",
                            "options":["","","",""],
                            "correctAnswer":"",
                            "explanation":""
                            }
                            ]
                            `
                }
            ]
        });

        let text = response.text;

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
                message: "AI returned an invalid quiz format."
            });
        }

        const quiz = await Quiz.create({
            user: req.user.id,
            topic: req.file.originalname,
            difficulty: difficulty || "Medium",
            questions
        });

        return res.status(201).json({
            success: true,
            quiz
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getQuizHistory = async (req, res) => {

    try {

        const quizzes = await Quiz.find({

            user: req.user.id

        }).sort({ createdAt: -1 });

        res.status(200).json({

            success: true,
            quizzes

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

exports.deleteQuiz = async (req, res) => {

    try {

        const quiz = await Quiz.findOneAndDelete({

            _id: req.params.id,
            user: req.user.id

        });

        if (!quiz) {

            return res.status(404).json({

                success: false,
                message: "Quiz not found"

            });

        }

        res.status(200).json({

            success: true,
            message: "Quiz deleted"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

exports.getQuiz = async (req, res) => {

    try {

        const quiz = await Quiz.findOne({

            _id: req.params.id,
            user: req.user.id

        });

        if (!quiz) {

            return res.status(404).json({

                success: false,
                message: "Quiz not found"

            });

        }

        res.status(200).json({

            success: true,
            quiz

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

exports.submitQuiz = async (req, res) => {

    try {

        const { answers } = req.body;

        const quiz = await Quiz.findOne({

            _id: req.params.id,
            user: req.user.id

        });

        if (!quiz) {

            return res.status(404).json({

                success: false,
                message: "Quiz not found"

            });

        }

        let score = 0;

        const result = quiz.questions.map((question, index) => {

            const userAnswer = answers[index] || "";

            const skipped = userAnswer === "";

            const correct = !skipped && userAnswer === question.correctAnswer;

            if (correct) score++;

            return {
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                userAnswer,
                correct,
                skipped
            };

        });

        quiz.score = score;
        quiz.totalQuestions = quiz.questions.length;
        quiz.completed = true;

        await quiz.save();

        res.status(200).json({

            success: true,

            score,

            total: quiz.questions.length,

            result,

            quiz

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};