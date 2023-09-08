import { Document } from "langchain/dist/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PromptTemplate } from "langchain/prompts";
import { STARTUP_INFO_PARSER_TEMPLATE  } from "./prompt_templates/startup_info_parser"
import { QNA_GENERATOR_TEMPLATE } from "./prompt_templates/qna_generator"
import { OpenAI as LangchainOpenAI } from "langchain/llms/openai";
import { logPretty, generateLogId } from './utils/logger'
import { OPEN_AI_COMPLETION } from './configs/open_ai';
import OpenAI from 'openai';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export async function parsePDF(filepath: string): Promise<string> {
  const logId = generateLogId();

  const documents = await loadPDF(filepath);
  const startupInfo = documents.map(doc => doc.pageContent).join('\n\n');

  const promptTemplate = new PromptTemplate({ template: STARTUP_INFO_PARSER_TEMPLATE, inputVariables: ['startupInfo'] });
  const prompt = await promptTemplate.format({ startupInfo });
  logPretty(logId, 'STARTUP_INFO_PARSER_TEMPLATE Prompt', prompt);

  const model = new LangchainOpenAI(OPEN_AI_COMPLETION);
  const modelResponse = await model.call(prompt);
  logPretty(logId, 'STARTUP_INFO_PARSER_TEMPLATE Prompt Response', modelResponse);

  let res = JSON.parse(modelResponse);
  res['info'] = startupInfo;
  res['need_user_input'] = false;

  return res;
}

export async function getQnaFromPDF(filepath: string, startupProfileId: string) {
  const logId = generateLogId();

  const documents = await loadPDF(filepath);
  const startupInfo = documents.map(doc => doc.pageContent).join('\n\n');
  await storeDeckInFirebase(filepath, startupProfileId, startupInfo);

  const promptTemplate = new PromptTemplate({ template: QNA_GENERATOR_TEMPLATE, inputVariables: ['startupInfo'] });
  const prompt = await promptTemplate.format({ startupInfo });
  logPretty(logId, 'STARTUP_PROFILE_GENERATOR_TEMPLATE Prompt', prompt);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [{ "role": "system", "content": "You are a helpful assistant." }, { role: "user", content: prompt }],
  });

  logPretty(logId, 'Startup Profile ID:', startupProfileId);

  let data = ''; // To accumulate the chunks of response data
  const firebaseCallPromises = []; // To store promises of Firebase calls

  for await (const part of stream) {
    const chunk = part.choices[0].delta.content || "";
    data += chunk; // accumulate

    const endIndex = data.indexOf('}');
    if (endIndex !== -1) {
      const startIndex = data.indexOf('{');

      const jsonObject = data.slice(startIndex, endIndex + 1); // Extract the JSON object
      data = data.slice(endIndex + 1); // Remove the extracted JSON object from the accumulated data
      try {
        const parsedObject = JSON.parse(jsonObject);
        logPretty(logId, 'parsedObject', parsedObject);

        const firebaseCallPromise = storeInFirebase(startupProfileId, parsedObject);
        firebaseCallPromises.push(firebaseCallPromise);
      } catch (err) {
        logPretty(logId, 'erraneous JSON', jsonObject);
        console.error('Error while parsing JSON:', err);
      }
    }
  }

  // Wait for all Firebase calls to finish
  await Promise.all(firebaseCallPromises);
}

async function loadPDF(filepath: string): Promise<Document[]> {
  const loader = new PDFLoader(filepath, { splitPages: false });

  return await loader.load();
}

async function storeInFirebase(startupProfileId: string, parsedObject: any) {
  return new Promise((resolve, reject) => {
    const db = getFirestore();

    parsedObject['startupProfile'] = db.doc(`startupProfile/${startupProfileId}`);
    parsedObject['startupProfileId'] = startupProfileId; // This is because you can't yet query using a reference field from Firebase console.
    parsedObject['createdAt'] = new Date();
    parsedObject['updatedAt'] = new Date();
    const res = db.collection('qnas').doc().set(parsedObject);

    resolve(res);
  });
}


async function storeDeckInFirebase(filepath: string, startupProfileId: string, deckText: string) {

  // Upload to Firebase storage
  const storage = getStorage();
  const filename = filepath.split('/').slice(-1).pop();
  const metadata = {
    contentType: 'application/pdf',
    destination: `decks/${filename}`
  };
  const bucket = storage.bucket('capitalcompass-9a9a7.appspot.com');
  const uploadResponse = await bucket.upload(`${filepath}`, metadata);
  const firebasePath = uploadResponse[0].name;


  // Store info in Firebase DB
  const db = getFirestore();
  const res = await db.collection('decks').doc().set({
    filePath: firebasePath,
    textContent: deckText,
    startupProfile: db.doc(`startupProfile/${startupProfileId}`),
    startupProfileId: startupProfileId, // This is because you can't yet query using a reference field from Firebase console.
    createdAt: new Date(),
    updatedAt: new Date()
  });
}