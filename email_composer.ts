import { PromptTemplate } from "langchain/prompts";
import { EMAIL_COMPOSER_TEMPLATE } from "./prompt_templates/email_composer"
import { OpenAI } from "langchain/llms/openai";

interface Investor {
  name: string;
  info: string;
  reason_for_matching: string;
}

export async function composeEmail(startupInfo: string, investor: Investor): Promise<string> {
  console.log(`Investor: ${JSON.stringify(investor)}`);

  const promptA = new PromptTemplate({ template: EMAIL_COMPOSER_TEMPLATE, inputVariables: ['startupInfo', 'investorName', 'investorInfo', 'investorMatchReason'] });
  const prompt = await promptA.format({
    startupInfo, investorName: investor.name, investorInfo: investor.info, investorMatchReason: investor.reason_for_matching });
  console.log('prompt:\n' + prompt);

  const model = new OpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.1 });
  const resA = await model.call(prompt);
  console.log(resA);

  return resA;
}
