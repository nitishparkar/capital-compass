import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export async function testFirebase() {
  const db = getFirestore();
  const res = await db.collection('testdata').doc().set({'key': 'val'});
}

export async function testFirestore(filepath: string) {
  const storage = getStorage();

  const filename = filepath.split('/').slice(-1).pop();
  const metadata = {
    contentType: 'application/pdf',
    destination: `decks/${filename}`
  };
  const bucket = storage.bucket('capitalcompass-9a9a7.appspot.com');
  const uploadResponse = await bucket.upload(`${filepath}`, metadata);

  console.log('uploadResponse', uploadResponse[0].name);
}