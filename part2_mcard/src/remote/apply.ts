import { store } from './firebase';
import { addDoc, collection } from 'firebase/firestore';
import { COLLECTIONS } from '@constants';
import { ApplyValues } from '@models/apply';

export async function applyCard(applyValues: ApplyValues) {
  return addDoc(collection(store, COLLECTIONS.CARD_APPLY), applyValues);
}
