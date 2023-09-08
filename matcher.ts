import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { MATCHMAKER_TEMPLATE } from "./prompt_templates/matchmaker"
import { PromptTemplate } from "langchain/prompts";
import { Document } from 'langchain/document';
import { logPretty, generateLogId } from './utils/logger';
import { OPEN_AI_COMPLETION, OPEN_AI_EMBEDDINGS } from './configs/open_ai';
import { getFirestore } from 'firebase-admin/firestore';

const PINECONE_NO_OF_RESULTS = 4

export async function matchInvestor(startupInfo: string) {
  const logId = generateLogId();

  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX || '');
  const namespace = process.env.PINECONE_NAMESPACE || '';
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(OPEN_AI_EMBEDDINGS),
    { pineconeIndex, namespace }
  );

  const results = await vectorStore.similaritySearch(startupInfo, PINECONE_NO_OF_RESULTS, {});
  logPretty(logId, 'Pinecone results', JSON.stringify(results));

  const promptTemplate = new PromptTemplate({ template: MATCHMAKER_TEMPLATE, inputVariables: ['startupInfo', 'investors'] });
  const prompt = await promptTemplate.format({ startupInfo: startupInfo, investors: results.map(doc => doc.pageContent).join('\n') });
  logPretty(logId, 'MATCHMAKER_TEMPLATE Prompt', prompt);

  const model = new OpenAI(OPEN_AI_COMPLETION);
  const modelResponse = await model.call(prompt);
  logPretty(logId, 'MATCHMAKER_TEMPLATE Prompt Response', modelResponse);

  let res = JSON.parse(modelResponse);
  res.forEach((investor: any) => {
    investor['id'] = findIdUsingName(results, investor['name']);
  });

  return res;
}

export async function findInvestors(startupProfileId: string) {
  let startupInfo: string = "";

  const db = getFirestore();
  const startupProfileDocRef = db.collection('startupProfile').doc(startupProfileId);
  const qnasRef = db.collection('qnas');
  const qnas = await qnasRef.where('startupProfile', '==', startupProfileDocRef).get();

  qnas.forEach((qnaDoc) => {
    const qnaData = qnaDoc.data();
    const question = qnaData.question;
    const answer = qnaData.answer;

    startupInfo += `Question: ${question}\nAnswer: ${answer}\n\n`;
  });

  return matchInvestor(startupInfo);
}

function findIdUsingName(documents: Document[], name: string): string {
  const document = documents.find(doc => (doc.metadata.name === name))

  if (document) {
    return document.metadata.id;
  }

  console.error(`Could not find id for investor ${name}`)
  return '';
}