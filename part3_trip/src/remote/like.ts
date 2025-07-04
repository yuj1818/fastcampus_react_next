import { COLLECTIONS } from '@constants';
import {
  query,
  collection,
  where,
  orderBy,
  getDocs,
  limit,
  setDoc,
  doc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { store } from './firebase';
import { Like } from '@models/like';
import { Hotel } from '@models/hotel';

export async function getLikes({ userId }: { userId: string }) {
  const snapshot = await getDocs(
    query(
      collection(store, COLLECTIONS.LIKE),
      where('userId', '==', userId),
      orderBy('order', 'asc'),
    ),
  );

  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Like,
  );
}

export async function toggleLike({
  hotel,
  userId,
}: {
  hotel: Pick<Hotel, 'name' | 'id' | 'mainImageUrl'>;
  userId: string;
}) {
  const findSnapshot = await getDocs(
    query(
      collection(store, COLLECTIONS.LIKE),
      where('userId', '==', userId),
      where('hotelId', '==', hotel.id),
    ),
  );

  if (findSnapshot.docs.length > 0) {
    const removeTarget = findSnapshot.docs[0];
    const removeTargetOrder = removeTarget.data().order;

    const updateTargetSnapshot = await getDocs(
      query(
        collection(store, COLLECTIONS.LIKE),
        where('userId', '==', userId),
        where('order', '>', removeTargetOrder),
      ),
    );

    if (updateTargetSnapshot.empty) {
      return deleteDoc(removeTarget.ref);
    } else {
      const batch = writeBatch(store);

      updateTargetSnapshot.forEach((doc) => {
        batch.update(doc.ref, { order: doc.data().order - 1 });
      });

      await batch.commit();

      return deleteDoc(removeTarget.ref);
    }
  } else {
    const lastLikeSnapshot = await getDocs(
      query(
        collection(store, COLLECTIONS.LIKE),
        where('userId', '==', userId),
        orderBy('order', 'desc'),
        limit(1),
      ),
    );

    const lastOrder = lastLikeSnapshot.empty
      ? 0
      : lastLikeSnapshot.docs[0].data().order;

    const newLike = {
      order: lastOrder + 1,
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelMainImageUrl: hotel.mainImageUrl,
      userId,
    };

    return setDoc(doc(collection(store, COLLECTIONS.LIKE)), newLike);
  }
}
