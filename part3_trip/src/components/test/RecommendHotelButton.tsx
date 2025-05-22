import Button from '@shared/Button';
import { collection, writeBatch, getDocs } from 'firebase/firestore';
import { COLLECTIONS } from '@constants';
import { store } from '@remote/firebase';

function RecommendHotelButton() {
  const handleButtonClick = async () => {
    /* 
    1. 전체 호텔 가져와서
    2. 전체 호텔 루프
    3. 호텔 + 추천 호텔 아이디 5개 추가
    */

    const batch = writeBatch(store);
    const snapshot = await getDocs(collection(store, COLLECTIONS.HOTEL));

    snapshot.docs.forEach((hotel) => {
      const recommendHotels = [];

      for (let doc of snapshot.docs) {
        if (recommendHotels.length === 5) {
          break;
        }

        if (doc.id !== hotel.id) {
          recommendHotels.push(doc.id);
        }
      }

      batch.update(hotel.ref, {
        recommendHotels,
      });
    });

    await batch.commit();

    alert('업데이트가 완료되었습니다.');
  };

  return <Button onClick={handleButtonClick}>추천호텔 데이터 추가하기</Button>;
}

export default RecommendHotelButton;
