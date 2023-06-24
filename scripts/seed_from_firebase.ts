/*
This needs `firebase-admin` package, which is not part of package.json
*/

import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
import * as FirebaseAdmin from 'firebase-admin';
import { ServiceAccount } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const FIREBASE_CONFIG = JSON.parse(fs.readFileSync(path.resolve(__dirname, './firebase-config.json'), 'utf-8'));

interface Investor {
  id: string;
  name: string;
  photoURL: string;
  info: string;
  portfolio: string;
  geographicalFocus: string;
  industryFocus: string;
  investmentSize: string;
  investmentStage: string;
}

async function seedInvestorsFromFirebase(): Promise<boolean> {
  FirebaseAdmin.initializeApp({ credential: FirebaseAdmin.credential.cert(FIREBASE_CONFIG as ServiceAccount) })

  const database = getFirestore();
  const snapshot = await database
    .collection('investors')
    .get();

  let investors: Array<Investor> = []
  snapshot.forEach(doc => {
    let inv: Investor = doc.data() as Investor
    inv.id = doc.id;
    investors.push(inv);
  });

  console.log("investors-----------------");
  console.log(investors);
  console.log("------------investors");

  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX || '');
  const namespace = 'dev-namespace';
  await pineconeIndex.delete1({ deleteAll: true, namespace });

  const docs = investors.map(function (investor: any) {
    return new Document({
      metadata: { id: investor.id, name: investor.name },
      pageContent: pageContentFromInvestor(investor),
    })
  });

  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }), {
    pineconeIndex,
    namespace
  });

  console.log('Data inserted!');

  // Fetch inserted data to verify (for testing)
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }),
    { pineconeIndex, namespace }
  );
  const model = new OpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.1 });
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 10,
    returnSourceDocuments: true,
  });
  const response = await chain.call({ query: "who are the investors?" });
  console.log('Similarity Search Results:');
  response.sourceDocuments.forEach((doc: Document) => {
    console.log(doc.metadata);
    console.log(doc.pageContent);
    console.log('----');
  });

  return true;
};

function pageContentFromInvestor(investor: Investor): string {
  return `Name: ${investor.name}

${investor.info}

Industry Focus:
${investor.industryFocus}

Investment Size:
${investor.investmentSize}

Investment Stage:
${investor.investmentStage}

Geographical Focus:
${investor.geographicalFocus}

Portfolio:
${investor.portfolio}
`
}

seedInvestorsFromFirebase().then(function() {
  console.log('Embeddings pushed to Pinecone successfully.')
}).catch(function(error) {
  console.error(`Failed to push embeddings to Pinecone. ${error}`)
});