import OpenAI from 'openai';
import express, { Response } from 'express';

export async function testStreaming(res: Response) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [{ "role": "system", "content": "You are a helpful assistant." }, { role: "user", content: "Return an array of 5 JSON objects. Each object contains two keys - head and body. Values are random words.  Return only the JSON array. Do not include any additional commentary in the response." }],
  });

  // res.setHeader('Cache-Control', 'no-cache');
  // res.setHeader('Content-Type', 'text/event-stream');
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Connection', 'keep-alive');
  // res.flushHeaders(); // flush the headers to establish SSE with client

  let data = ''; // To accumulate the chunks of response data

  for await (const part of stream) {
    const chunk = part.choices[0].delta.content || "";
    data += chunk // accumulate

    const endIndex = data.indexOf('}');
    if (endIndex !== -1) {
      const startIndex = data.indexOf('{');

      const jsonObject = data.slice(startIndex, endIndex + 1); // Extract the JSON object
      data = data.slice(endIndex + 1); // Remove the extracted JSON object from the accumulated data
      try {
        const parsedObject = JSON.parse(jsonObject);
        console.log(parsedObject); // Handle the parsed JSON object here
        res.write(jsonObject);
      } catch (err) {
        console.error('Error while parsing JSON:', err);
      }
    }
  }
}