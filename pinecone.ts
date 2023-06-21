import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
import fs from 'fs';

export async function testPinecone() {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX || '');
  const namespace = 'test-namespace';
  await pineconeIndex.delete1({deleteAll: true, namespace});

  const docs = [
    new Document({
      metadata: { foo: "bar" },
      pageContent: "pinecone is a vector db",
    }),
    new Document({
      metadata: { foo: "bar" },
      pageContent: "the quick brown fox jumped over the lazy dog",
    }),
    new Document({
      metadata: { baz: "qux" },
      pageContent: "lorem ipsum dolor sit amet",
    }),
    new Document({
      metadata: { baz: "qux" },
      pageContent: "pinecones are the woody fruiting body and of a pine tree",
    }),
  ];

  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002'}), {
    pineconeIndex,
    namespace
  });
  console.log('Data inserted!');

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace }
  );
  /* Search the vector DB independently with meta filters */
  const results = await vectorStore.similaritySearch("pinecone", 2, {
    foo: "bar",
  });
  console.log('Similarity Search with Metadata Results:');
  console.log(results);

  const model = new OpenAI();
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 2,
    returnSourceDocuments: true,
  });
  const response = await chain.call({ query: "What is pinecone?" });
  console.log('Similarity Search Results:');
  console.log(response);
}


export async function seedInvestors() {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX || '');
  const namespace = 'dev-namespace';
  await pineconeIndex.delete1({ deleteAll: true, namespace });

  var investors = JSON.parse(fs.readFileSync('./seed_data/investors.json', 'utf-8'))
  console.log("investors-----------------");
  console.log(investors);
  console.log("------------investors");

  const docs = investors.map(function(investor: any) {
    return new Document({
      metadata: { name: investor.name },
      pageContent: JSON.stringify(investor),
    })
  });

  // docs.forEach((doc: Document) => {
  //   console.log(doc);
  //   console.log(JSON.stringify(doc.pageContent));
  // });

  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings({ modelName: 'text-embedding-ada-002' }), {
    pineconeIndex,
    namespace
  });
  console.log('Data inserted!');
};

// testPinecone().then(function() {
//   console.log('Embeddings pushed to Pinecone successfully.')
// }).catch(function(error) {
//   console.error(`Failed to push embeddings to Pinecone. ${error}`)
// })
