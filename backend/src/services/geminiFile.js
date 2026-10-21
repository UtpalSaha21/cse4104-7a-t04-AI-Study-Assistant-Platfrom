const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function uploadPdf(filePath) {
    const file = await ai.files.upload({
        file: filePath,
        config: {
            mimeType: "application/pdf"
        }
    });

    return file;
}

module.exports = {
    uploadPdf
};