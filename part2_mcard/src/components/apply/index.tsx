import { ApplyValues, APPLY_STATUS } from '@models/apply';
import BasicInfo from '@components/apply/BasicInfo';
import CardInfo from '@components/apply/CardInfo';
import Terms from '@components/apply/Terms';
import { useEffect, useState } from 'react';
import useUser from '@hooks/auth/useUser';
import { useParams } from 'react-router-dom';
import ProgressBar from '@shared/ProgressBar';
import { css } from '@emotion/react';
import Flex from '@shared/Flex';

const LAST_STEP = 3;

function Apply({
  onSubmit,
}: {
  onSubmit: (appliyValues: ApplyValues) => void;
}) {
  const user = useUser();
  const { id } = useParams() as { id: string };

  const storageKey = `applied-${user?.uid}-${id}`;

  const [applyValues, setApplyValues] = useState<Partial<ApplyValues>>(() => {
    const applied = localStorage.getItem(storageKey);

    if (applied == null) {
      return {
        userId: user?.uid,
        cardId: id,
        step: 0,
      };
    }

    return JSON.parse(applied);
  });

  useEffect(() => {
    if (applyValues.step === 3) {
      localStorage.removeItem(storageKey);

      onSubmit({
        ...applyValues,
        appliedAt: new Date(),
        status: APPLY_STATUS.READY,
      } as ApplyValues);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(applyValues));
    }
  }, [applyValues, onSubmit, storageKey]);

  const handleTermsChange = (terms: ApplyValues['terms']) => {
    setApplyValues((prev) => ({
      ...prev,
      terms,
      step: (prev.step as number) + 1,
    }));
  };

  const handleBasicInfoChange = (
    infoValues: Pick<ApplyValues, 'salary' | 'creditScore' | 'payDate'>,
  ) => {
    setApplyValues((prev) => ({
      ...prev,
      ...infoValues,
      step: (prev.step as number) + 1,
    }));
  };

  const handleCardInfoChange = (
    cardInfoValues: Pick<ApplyValues, 'isHipass' | 'isMaster' | 'isRf'>,
  ) => {
    setApplyValues((prev) => ({
      ...prev,
      ...cardInfoValues,
      step: (prev.step as number) + 1,
    }));
  };

  return (
    <Flex direction="column" css={ContainerStyles}>
      <ProgressBar progress={(applyValues.step as number) / LAST_STEP} />
      {applyValues.step === 0 ? <Terms onNext={handleTermsChange} /> : null}
      {applyValues.step === 1 ? (
        <BasicInfo onNext={handleBasicInfoChange} />
      ) : null}
      {applyValues.step === 2 ? (
        <CardInfo onNext={handleCardInfoChange} />
      ) : null}
    </Flex>
  );
}

const ContainerStyles = css`
  margin-top: 20px;
  padding: 0 24px 80px 24px;
  gap: 16px;
`;

export default Apply;
