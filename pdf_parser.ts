import { Document } from "langchain/dist/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PromptTemplate } from "langchain/prompts";
import { STARTUP_INFO_PARSER_TEMPLATE  } from "./prompt_templates/startup_info_parser"
import { OpenAI } from "langchain/llms/openai";
import { logPretty, generateLogId } from './utils/logger'
import { OPEN_AI_COMPLETION } from './configs/open_ai';

export async function parsePDF(filepath: string): Promise<string> {
  const logId = generateLogId();

  const documents = await loadPDF(filepath);
  const startupInfo = documents.map(doc => doc.pageContent).join('\n\n');

  const promptTemplate = new PromptTemplate({ template: STARTUP_INFO_PARSER_TEMPLATE, inputVariables: ['startupInfo'] });
  const prompt = await promptTemplate.format({ startupInfo });
  logPretty(logId, 'STARTUP_INFO_PARSER_TEMPLATE Prompt', prompt);

  const model = new OpenAI(OPEN_AI_COMPLETION);
  const modelResponse = await model.call(prompt);
  logPretty(logId, 'STARTUP_INFO_PARSER_TEMPLATE Prompt Response', modelResponse);

  let res = JSON.parse(modelResponse);
  res['info'] = startupInfo;
  res['need_user_input'] = false;

  return res;
}

async function loadPDF(filepath: string): Promise<Document[]> {
  const loader = new PDFLoader(filepath, { splitPages: false });

  return await loader.load();
}