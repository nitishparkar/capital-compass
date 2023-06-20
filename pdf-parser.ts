import { Document } from "langchain/dist/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";

export async function parsePDF(filepath: string) {
  const documents = await loadUsingPDFLoader(filepath);
  // loadUsingUnstructuredLoader(filepath);

  // TODO: Pass through LLM and then store in DB
  console.log('Parsed content:')
  documents.forEach(doc => {
    console.log(doc.pageContent);
  });
  console.log('--------');
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