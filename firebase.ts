import { getFirestore } from 'firebase-admin/firestore';

export async function testFirebase() {
  const db = getFirestore();
  const res = await db.collection('testdata').doc().set({'key': 'val'});
}