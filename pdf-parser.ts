import { Document } from "langchain/dist/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";
import { PromptTemplate } from "langchain/prompts";
import { STARTUP_INFO_PARSER_TEMPLATE  } from "./prompt_templates/startup_info_parser"
import { OpenAI } from "langchain/llms/openai";

export async function parsePDF(filepath: string): Promise<string> {
  const documents = await loadUsingPDFLoader(filepath);

  const startupInfo = documents.map(doc => doc.pageContent).join('\n\n');

  // A `PromptTemplate` consists of a template string and a list of input variables.
  const promptA = new PromptTemplate({ template: STARTUP_INFO_PARSER_TEMPLATE, inputVariables: ["startupInfo"] });
  const prompt = await promptA.format({ startupInfo: startupInfo });
  console.log('prompt:\n' + prompt);

  const model = new OpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.1 });
  const resA = await model.call(prompt);
  console.log(resA);

  // TODO: Pass through LLM and then store in DB
  // console.log('Parsed content:' + `L: - ${documents.length}`)
  // documents.forEach(doc => {
  //   console.log(doc.pageContent);
  // });
  // console.log('--------');

  return JSON.parse(resA);
}

async function loadUsingPDFLoader(filepath: string): Promise<Document[]> {
  const loader = new PDFLoader(filepath, { splitPages: false });

  return await loader.load();
}

async function loadUsingUnstructuredLoader(filepath: string) {
  const options = { strategy: 'hi_res' };

  const loader = new UnstructuredLoader(
    filepath,
    options
  );

  const docs = await loader.load();

  docs.forEach(doc => {
    console.log(doc.pageContent);
  });
}