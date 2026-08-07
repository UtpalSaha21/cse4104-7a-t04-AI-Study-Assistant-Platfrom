const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const ai = require("../config/gemini");

// Ask AI (Dummy Version)
exports.askAI = async (req, res) => {

    try {

        const { conversationId, question } = req.body;

        if (!conversationId || !question) {

            return res.status(400).json({
                success: false,
                message: "Conversation ID and question are required"
            });

        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        // Save user message
        await Message.create({

            conversation: conversationId,
            role: "user",
            content: question

        });

        const history = await Message.find({
            conversation: conversationId
        })
            .sort({ createdAt: 1 })
            .limit(20);


        // Ask Gemini
        const contents = history.map(msg => ({

            role: msg.role === "assistant" ? "model" : "user",

            parts: [{
                text: msg.content
            }]

        }));

        if (conversation.type === "pdf") {

            contents.unshift({
                role: "user",
                parts: [{
                    text: `You are an AI Study Assistant.

                           Answer ONLY using the uploaded PDF whenever possible.

                           If the answer is not found in the PDF, clearly say:
                           "I couldn't find that information in the uploaded document."

                           Do not invent information.
                           Keep answers clear and suitable for students.`
                }]
            });

        }

        if (conversation.type === "pdf") {

            contents.push({

                role: "user",

                parts: [

                    {
                        fileData: {
                            mimeType: "application/pdf",
                            fileUri: conversation.fileUri
                        }
                    },

                    {
                        text: question
                    }

                ]

            });

        } else {

            contents.push({

                role: "user",

                parts: [

                    {
                        text: question
                    }

                ]

            });

        }

        const stream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents
        });

        let aiResponse = "";

        for await (const chunk of stream) {
            aiResponse += chunk.text;
        }

        // Save assistant message
        const assistantMessage = await Message.create({

            conversation: conversationId,
            role: "assistant",
            content: aiResponse

        });

        // Update conversation timestamp
        await Conversation.findByIdAndUpdate(
            conversationId,
            { updatedAt: Date.now() }
        );

        res.status(201).json({

            success: true,
            message: assistantMessage

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};