import Agreement from '@shared/Agreement';
import { 약관목록 } from '@constants/apply';
import { ApplyValues, Term } from '@models/apply';
import FixedBottomButton from '@shared/FixedBottomButton';
import { MouseEvent, useCallback, useState } from 'react';

function Terms({ onNext }: { onNext: (terms: ApplyValues['terms']) => void }) {
  const [termsAgreements, setTermsAgreements] = useState(() => {
    return 약관목록.reduce<Record<string, boolean>>(
      (prev, term) => ({
        ...prev,
        [term.id]: false,
      }),
      {},
    );
  });

  const handleAllAgreement = useCallback(
    (_: MouseEvent<HTMLElement>, checked: boolean) => {
      setTermsAgreements((prevTerms) => {
        return Object.keys(prevTerms).reduce(
          (prev, key) => ({
            ...prev,
            [key]: checked,
          }),
          {},
        );
      });
    },
    [],
  );

  const isAllAgreed = Object.values(termsAgreements).every(
    (agreement) => agreement,
  );

  return (
    <div>
      <Agreement>
        <Agreement.Title checked={isAllAgreed} onChange={handleAllAgreement}>
          약관에 모두 동의
        </Agreement.Title>
        {약관목록.map(({ id, title, link }: Term) => (
          <Agreement.Description
            key={id}
            link={link}
            checked={termsAgreements[id]}
            onChange={(_, checked) => {
              setTermsAgreements((prev) => ({
                ...prev,
                [id]: checked,
              }));
            }}
          >
            {title}
          </Agreement.Description>
        ))}
      </Agreement>
      <FixedBottomButton
        label="약관동의"
        disabled={!isAllAgreed}
        onClick={() => {
          onNext(Object.keys(termsAgreements));
        }}
      />
    </div>
  );
}

export default Terms;
