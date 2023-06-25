import { PromptTemplate } from "langchain/prompts";
import { EMAIL_COMPOSER_TEMPLATE } from "./prompt_templates/email_composer"
import { OpenAI } from "langchain/llms/openai";
import { logPretty, generateLogId } from './utils/logger';
import { OPEN_AI_COMPLETION } from './configs/open_ai';

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

  const model = new OpenAI(OPEN_AI_COMPLETION);
  const modelResponse = await model.call(prompt);
  logPretty(logId, 'EMAIL_COMPOSER_TEMPLATE Prompt Response', modelResponse);

  return modelResponse;
}
