import { ChangeEvent, useCallback, useState } from 'react';
import Select from '@shared/Select';
import FixedBottomButton from '@shared/FixedBottomButton';
import { 연소득옵션, 신용점수옵션, 결제일옵션 } from '@constants/apply';
import { ApplyValues } from '@models/apply';

type InfoValues = Pick<ApplyValues, 'salary' | 'creditScore' | 'payDate'>;

function BasicInfo({ onNext }: { onNext: (infoValues: InfoValues) => void }) {
  const [infoValues, setInfoValues] = useState<InfoValues>({
    salary: '',
    creditScore: '',
    payDate: '',
  });

  const handleInfoChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setInfoValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const isAllSelected = Object.values(infoValues).every((value) => value);

  return (
    <div>
      <Select
        label="연소득"
        options={연소득옵션}
        placeholder={연소득옵션[0].label}
        value={infoValues.salary}
        onChange={handleInfoChange}
        name="salary"
      />
      <Select
        label="신용점수"
        options={신용점수옵션}
        placeholder={신용점수옵션[0].label}
        value={infoValues.creditScore}
        onChange={handleInfoChange}
        name="creditScore"
      />
      <Select
        label="결제일"
        options={결제일옵션}
        placeholder={결제일옵션[0].label}
        value={infoValues.payDate}
        onChange={handleInfoChange}
        name="payDate"
      />

      <FixedBottomButton
        label="다음"
        onClick={() => {
          onNext(infoValues);
        }}
        disabled={!isAllSelected}
      />
    </div>
  );
}

export default BasicInfo;
