import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey:process.env.OPEN_AI_API_KEY});

const structure = {
    code: "code snippet",
    filename: "file name",
}

async function generate_code() {
  const completion = await openai.chat.completions.create({
    model:"gpt-4-1106-preview",
    response_format:{ "type": "json_object" },
    messages: [{"role": "system", "content": "You are a helpful assistant who is proficient in generating code."},
        {"role": "user", "content": `Please help me generate two things: 1. A random code snippet for me or else you can generate a random complex function. 2. A random name of the file in which i should store this code. Make sure the file name as well as the cpde snippets are random and unique everytime i run this. The output should be in json format and the structure should look like this ${structure}`},]
  });

  return completion.choices[0].message.content;
}

export default generate_code;