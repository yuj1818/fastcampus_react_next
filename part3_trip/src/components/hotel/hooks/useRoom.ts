import { useQuery, useQueryClient } from 'react-query';
import { getRooms } from '@remote/room';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { useEffect } from 'react';
import { store } from '@remote/firebase';
import { COLLECTIONS } from '@constants';
import { Room } from '@models/room';

function useRooms({ hotelId }: { hotelId: string }) {
  const client = useQueryClient();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(doc(store, COLLECTIONS.HOTEL, hotelId), COLLECTIONS.ROOM),
      (snapshot) => {
        const newRooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Room),
        }));

        client.setQueryData(['rooms', hotelId], newRooms);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [hotelId, client]);

  return useQuery(['rooms', hotelId], () => getRooms(hotelId));
}

export default useRooms;
