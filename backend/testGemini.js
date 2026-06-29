require("dotenv").config();

const ai = require("./src/config/gemini");

async function test(){

    const response = await ai.models.generateContent({

        model:"gemini-2.5-flash",

        contents:"Hello Gemini!"

    });

    console.log(response.text);

}

test();