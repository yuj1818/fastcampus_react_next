import { useEffect } from 'react';
import Top from '@shared/Top';
import { getCards } from '@remote/card';

function HomePage() {
  useEffect(() => {
    getCards().then((res) => {
      console.log('response', res);
    });
  }, []);

  return (
    <div>
      <Top
        title="혜택 좋은 카드"
        subTitle="회원님을 위해서 혜택 좋은 카드를 모아봤어요"
      />
    </div>
  );
}

export default HomePage;
