const Summary = require("../models/Summary");
const ai = require("../config/gemini");
const { uploadPdf } = require("../services/geminiFile");
const handleAIError = require("../services/aiErrorHandler");

// Generate Summary
exports.generateSummary = async (req, res) => {

    try {

        const { title, inputText } = req.body;

        if (!title || !inputText) {

            return res.status(400).json({

                success: false,
                message: "Title and input text are required."

            });

        }

        const ai = require("../config/gemini");

        const response = await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: `Summarize this text:\n\n${inputText}`

        });

        const generatedSummary = response.text?.trim();

        if (!generatedSummary) {
            return res.status(500).json({
                success: false,
                message: "The AI service returned an empty summary. Please try again."
            });
        }

        const summary = await Summary.create({

            user: req.user.id,

            title,

            inputText,

            generatedSummary

        });

        res.status(201).json({

            success: true,
            summary

        });

    }

    catch (error) {

        return handleAIError(error, res);

    }

};

exports.generateSummaryFromPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF file."
            });
        }

        // Upload PDF to Gemini
        const uploadedFile = await uploadPdf(req.file.path);

        // Generate summary
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
                            Read the uploaded PDF carefully and generate a study summary.

                            Return ONLY valid JSON.

                            {
                            "title":"",
                            "category":"",
                            "summary":"",
                            "keyPoints":[
                                "",
                                "",
                                "",
                                "",
                                ""
                            ],
                            "context":""
                            }

                            Rules:
                            - title = document title
                            - category = subject/category
                            - summary = concise 1-2 paragraph summary
                            - keyPoints = 5 important points
                            - context = brief background

                            Do NOT include markdown.
                            Do NOT include \`\`\`json.
                            Return ONLY the JSON object.
                            `
                }
            ]
        });

        let text = response.text || "";

        // Remove markdown if Gemini adds it
        text = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        let result;

        try {
            result = JSON.parse(text);
        } catch (err) {
            console.log("===== RAW GEMINI RESPONSE =====");
            console.log(text);
            console.log("===============================");

            return res.status(500).json({
                success: false,
                message: "Gemini returned invalid JSON."
            });
        }

        if (
            !result ||
            typeof result !== "object" ||
            typeof result.title !== "string" ||
            typeof result.summary !== "string" ||
            !Array.isArray(result.keyPoints) ||
            result.keyPoints.length === 0
        ) {
            return res.status(500).json({
                success: false,
                message: "AI returned an incomplete summary format."
            });
        }

        // Ensure all fields exist
        result.title = result.title || "Untitled";
        result.category = result.category || "General";
        result.summary = result.summary || "No summary generated.";
        result.keyPoints = Array.isArray(result.keyPoints)
            ? result.keyPoints
            : [];
        result.context = result.context || "";

        const summary = await Summary.create({

            user: req.user.id,

            title: result.title,

            category: result.category,

            summary: result.summary,

            keyPoints: result.keyPoints,

            context: result.context,

            fileName: req.file.originalname

        });

        return res.status(201).json({

            success: true,

            summary

        });

    } catch (err) {
        return handleAIError(error, res);
    }
};


exports.getSummaryHistory = async (req, res) => {

    try {

        const summaries = await Summary.find({

            user: req.user.id

        }).sort({ createdAt: -1 });

        res.json({

            success: true,

            summaries

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.deleteSummary = async (req, res) => {

    try {

        await Summary.findOneAndDelete({

            _id: req.params.id,

            user: req.user.id

        });

        res.json({

            success: true

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};