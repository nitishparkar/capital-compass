import OpenAI from 'openai';
import express, { Response } from 'express';


export async function testStreaming(res: Response) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [{ "role": "system", "content": "You are a helpful assistant." }, { role: "user", content: "Who was Dr. APJ Abdul Kalam?" }],
  });

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  for await (const part of stream) {
    console.log(part.choices[0].delta.content);
    res.write(part.choices[0].delta.content || "");
  }
}