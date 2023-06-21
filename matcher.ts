import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
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
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace }
  );

  const model = new OpenAI({ modelName: 'gpt-3.5-turbo' });
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 2,
    returnSourceDocuments: true,
  });

  const promptA = new PromptTemplate({ template: MATCHMAKER_TEMPLATE, inputVariables: ["startupInfo"] });
  const prompt = await promptA.format({ startupInfo: summary });
  console.log('prompt:\n' + prompt);
  const response = await chain.call({ query: prompt });
  console.log('Similarity Search Results:');
  console.log(response);
}