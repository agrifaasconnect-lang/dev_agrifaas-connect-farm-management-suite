
import { db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  WhereFilterOp
} from 'firebase/firestore';

export const getDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

export const setDocument = async <T>(collectionName: string, id: string, data: any): Promise<void> => {
  await setDoc(doc(db, collectionName, id), data, { merge: true });
};

export const updateDocument = async (collectionName: string, id: string, data: any): Promise<void> => {
  await updateDoc(doc(db, collectionName, id), data);
};

export const addDocument = async (collectionName: string, data: any): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
};

export const queryCollection = async <T>(
  collectionName: string, 
  field?: string, 
  operator?: WhereFilterOp, 
  value?: any
): Promise<T[]> => {
  const collectionRef = collection(db, collectionName);
  let q = query(collectionRef);

  if (field && operator && value !== undefined) {
    q = query(collectionRef, where(field, operator, value));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};
