import { PromptTemplate } from "langchain/prompts";
import { EMAIL_COMPOSER_TEMPLATE } from "./prompt_templates/email_composer"
import { OpenAI } from "langchain/llms/openai";


export async function composeEmail(startupInfo: string, investorInfo: string): Promise<string> {
  const promptA = new PromptTemplate({ template: EMAIL_COMPOSER_TEMPLATE, inputVariables: ['startupInfo', 'investorInfo'] });
  const prompt = await promptA.format({ startupInfo, investorInfo });
  console.log('prompt:\n' + prompt);

  const model = new OpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.1 });
  const resA = await model.call(prompt);
  console.log(resA);

  return resA;
}
