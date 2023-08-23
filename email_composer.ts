import { PromptTemplate } from "langchain/prompts";
import { EMAIL_COMPOSER_TEMPLATE } from "./prompt_templates/email_composer"
import { OpenAI as LangchainOpenAI } from "langchain/llms/openai";
import { logPretty, generateLogId } from './utils/logger';
import { OPEN_AI_COMPLETION } from './configs/open_ai';
import OpenAI from 'openai';
import { Response } from 'express';

interface Investor {
  name: string;
  info: string;
  reason_for_matching: string;
}

export async function composeEmail(startupInfo: string, investor: Investor): Promise<string> {
  const logId = generateLogId();

  const promptTemplate = new PromptTemplate({ template: EMAIL_COMPOSER_TEMPLATE, inputVariables: ['startupInfo', 'investorName', 'investorInfo', 'investorMatchReason'] });
  const prompt = await promptTemplate.format({
    startupInfo: startupInfo,
    investorName: investor.name,
    investorInfo: investor.info,
    investorMatchReason: investor.reason_for_matching,
  });
  logPretty(logId, 'EMAIL_COMPOSER_TEMPLATE Prompt', prompt);

  const model = new LangchainOpenAI(OPEN_AI_COMPLETION);
  const modelResponse = await model.call(prompt);
  logPretty(logId, 'EMAIL_COMPOSER_TEMPLATE Prompt Response', modelResponse);

  return modelResponse;
}

export async function composeEmailStream(startupInfo: string, investor: Investor, res: Response) {
  const logId = generateLogId();

  const promptTemplate = new PromptTemplate({ template: EMAIL_COMPOSER_TEMPLATE, inputVariables: ['startupInfo', 'investorName', 'investorInfo', 'investorMatchReason'] });
  const prompt = await promptTemplate.format({
    startupInfo: startupInfo,
    investorName: investor.name,
    investorInfo: investor.info,
    investorMatchReason: investor.reason_for_matching,
  });
  logPretty(logId, 'EMAIL_COMPOSER_TEMPLATE Prompt', prompt);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [{ "role": "system", "content": "You are a helpful assistant." }, { role: "user", content: prompt }],
  });

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  for await (const part of stream) {
    const chunk = part.choices[0].delta.content || "";
    console.log(chunk);
    res.write(chunk);
  }
}
