import Button from '@shared/Button';
import Spacing from '@shared/Spacing';
import FixedBottomButton from '@shared/FixedBottomButton';
import { ApplyValues } from '@models/apply';
import { MouseEvent, useCallback, useState } from 'react';

type CardInfoValues = Pick<ApplyValues, 'isMaster' | 'isHipass' | 'isRf'>;

function CardInfo({
  onNext,
}: {
  onNext: (cardInfoValues: CardInfoValues) => void;
}) {
  const [cardInfoValues, setCardInfoValues] = useState<CardInfoValues>({
    isMaster: false,
    isHipass: false,
    isRf: false,
  });

  const { isHipass, isMaster, isRf } = cardInfoValues;

  const handleButtonClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const $button = e.target as HTMLButtonElement;
    setCardInfoValues((prev) => ({
      ...prev,
      [$button.name]: JSON.parse($button.dataset.value as string),
    }));
  }, []);

  return (
    <div>
      <Button.Group title="해외결제">
        <Button
          weak={!isMaster}
          size="medium"
          data-value={true}
          onClick={handleButtonClick}
          name="isMaster"
        >
          Master
        </Button>
        <Button
          weak={isMaster}
          size="medium"
          data-value={false}
          onClick={handleButtonClick}
          name="isMaster"
        >
          국내전용
        </Button>
      </Button.Group>
      <Spacing size={12} />
      <Button.Group title="후불교통가능">
        <Button
          weak={isRf}
          size="medium"
          data-value={false}
          onClick={handleButtonClick}
          name="isRf"
        >
          신청안함
        </Button>
        <Button
          weak={!isRf}
          size="medium"
          data-value={true}
          onClick={handleButtonClick}
          name="isRf"
        >
          신청
        </Button>
      </Button.Group>
      <Spacing size={12} />
      <Button.Group title="후불하이패스카드">
        <Button
          weak={isHipass}
          size="medium"
          data-value={false}
          onClick={handleButtonClick}
          name="isHipass"
        >
          신청안함
        </Button>
        <Button
          weak={!isHipass}
          size="medium"
          data-value={true}
          onClick={handleButtonClick}
          name="isHipass"
        >
          신청
        </Button>
      </Button.Group>
      <FixedBottomButton label="다음" onClick={() => onNext(cardInfoValues)} />
    </div>
  );
}

export default CardInfo;
