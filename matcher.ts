import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { MATCHMAKER_TEMPLATE } from "./prompt_templates/matchmaker"
import { PromptTemplate } from "langchain/prompts";

export async function matchInvestor(summary: string) {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX || '');
  const namespace = 'dev-namespace';

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }),
    { pineconeIndex, namespace }
  );


  const results = await vectorStore.similaritySearch(summary, 2, {});
  console.log(JSON.stringify(results));
  results.map(doc => doc.pageContent).forEach((pc) => {
    console.log(pc);
  });

  const model = new OpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.1 });
  const promptA = new PromptTemplate({ template: MATCHMAKER_TEMPLATE, inputVariables: ['startupInfo', 'investors'] });
  const prompt = await promptA.format({ startupInfo: summary, investors: results.map(doc => doc.pageContent).join('\n') });
  console.log('prompt:\n' + prompt);

  const resA = await model.call(prompt);
  console.log('Prompt response:');
  console.log(resA);

  return JSON.parse(resA);
}