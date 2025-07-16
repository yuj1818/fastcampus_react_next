import dynamic from 'next/dynamic';
import { useState, MouseEvent } from 'react';
import { TERMS } from '@constants/account';
import { Term } from '@models/account';
import Agreement from '@shared/Agreement';
const FixedBottomButton = dynamic(() => import('@shared/FixedBottomButton'));

function Terms({ onNext }: { onNext: (termIds: string[]) => void }) {
  const [termsAgreements, setTermsAgreements] = useState(() =>
    generateInitialValues(TERMS),
  );

  const handleAgreement = (id: string, checked: boolean) => {
    console.log('id', id);
    console.log('chekced', checked);
    setTermsAgreements((pre) => {
      return pre.map((term) => (term.id === id ? { ...term, checked } : term));
    });
  };

  const handleAllAgreement = (_: MouseEvent<HTMLElement>, checked: boolean) => {
    setTermsAgreements((pre) => {
      return pre.map((term) => ({ ...term, checked }));
    });
  };

  const isAllAgreed = termsAgreements.every((term) => term.checked);
  const isValid = termsAgreements
    .filter((term) => term.mandatory)
    .every((term) => term.checked);

  return (
    <div>
      <Agreement>
        <Agreement.Title checked={isAllAgreed} onChange={handleAllAgreement}>
          약관 모두 동의
        </Agreement.Title>
        {termsAgreements.map((term) => (
          <Agreement.Description
            key={term.id}
            link={term.link}
            checked={term.checked}
            onChange={(_, checked) => handleAgreement(term.id, checked)}
          >
            {term.mandatory ? '[필수]' : '[선택]'} {term.title}
          </Agreement.Description>
        ))}
      </Agreement>
      <FixedBottomButton
        label="약관동의"
        disabled={!isValid}
        onClick={() => {
          onNext(
            termsAgreements.filter((term) => term.checked).map(({ id }) => id),
          );
        }}
      />
    </div>
  );
}

function generateInitialValues(terms: Term[]) {
  return terms.map((term) => ({ ...term, checked: false }));
}

export default Terms;
