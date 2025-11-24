import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, addDoc } from 'firebase/firestore';

export const getDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  const docSnap = await getDoc(doc(db, collectionName, docId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
};

export const getCollection = async <T>(collectionName: string): Promise<T[]> => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const queryCollection = async <T>(collectionName: string, field?: string, operator?: any, value?: any): Promise<T[]> => {
  const q = field ? query(collection(db, collectionName), where(field, operator, value)) : collection(db, collectionName);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const setDocument = (collectionName: string, docId: string, data: any) =>
  setDoc(doc(db, collectionName, docId), data);

export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const updateDocument = (collectionName: string, docId: string, data: any) =>
  updateDoc(doc(db, collectionName, docId), data);

export const deleteDocument = (collectionName: string, docId: string) =>
  deleteDoc(doc(db, collectionName, docId));
