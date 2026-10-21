const handleAIError = (error, res) => {
    console.error("===== AI ERROR =====");
    console.error(error);
    console.error("====================");

    const status = error?.status || error?.response?.status;

    // Rate limit
    if (status === 429) {
        return res.status(429).json({
            success: false,
            message: "The AI service is currently busy. Please try again later."
        });
    }

    // Timeout
    if (
        error?.code === "ETIMEDOUT" ||
        error?.code === "ECONNABORTED" ||
        error?.message?.toLowerCase().includes("timeout")
    ) {
        return res.status(504).json({
            success: false,
            message: "The AI service took too long to respond. Please try again."
        });
    }

    // Network error
    if (
        error?.code === "ECONNREFUSED" ||
        error?.code === "ENOTFOUND" ||
        error?.code === "ECONNRESET"
    ) {
        return res.status(503).json({
            success: false,
            message: "The AI service is temporarily unavailable. Please try again later."
        });
    }

    // Generic AI/API error
    return res.status(500).json({
        success: false,
        message: "Something went wrong while processing your request with the AI service."
    });
};

module.exports = handleAIError;