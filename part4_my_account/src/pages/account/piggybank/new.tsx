import dynamic from 'next/dynamic';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useMutation } from 'react-query';
import withAuth from '@shared/hocs/withAuth';
import TextField from '@shared/TextField';
import Flex from '@shared/Flex';
import { Piggybank } from '@models/piggybank';
import useUser from '@hooks/useUser';
import { createPiggybank } from '@remote/piggybank';
import { useAlertContext } from '@contexts/AlertContext';
const FixedBottomButton = dynamic(() => import('@shared/FixedBottomButton'), {
  ssr: false,
});

function NewPiggybankPage() {
  const { open } = useAlertContext();
  const [formValues, setFormValues] = useState({
    name: '',
    endDate: '',
    goalAmount: '',
  });

  const user = useUser();

  const { mutate, isLoading } = useMutation(
    (newPiggybank: Piggybank) => createPiggybank(newPiggybank),
    {
      onSuccess: () => {
        open({
          title: '새로운 저금통을 만들었어요',
          onButtonClick: () => {
            window.history.back();
          },
        });
      },
      onError: () => {
        open({
          title: '저금통을 만들지 못했어요',
          description: '잠시 후 다시 시도해주세요',
          onButtonClick: () => {
            window.history.back();
          },
        });
      },
    },
  );

  const minDate = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const handleFormValues = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormValues((pre) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = () => {
    const newPiggyBank = {
      ...formValues,
      goalAmount: Number(formValues.goalAmount),
      userId: user?.id as string,
      startDate: new Date(),
      endDate: new Date(formValues.endDate),
      balance: 0,
    } as Piggybank;

    mutate(newPiggyBank);
  };

  return (
    <div>
      <Flex direction="column">
        <TextField
          name="name"
          label="통장이름"
          value={formValues.name}
          onChange={handleFormValues}
        />
        <TextField
          type="date"
          name="endDate"
          label="종료일자"
          min={minDate}
          value={formValues.endDate}
          onChange={handleFormValues}
        />
        <TextField
          type="number"
          name="goalAmount"
          label="목표금액"
          value={formValues.goalAmount}
          onChange={handleFormValues}
        />
      </Flex>
      <FixedBottomButton
        disabled={isLoading === true}
        label="저금통 생성하기"
        onClick={handleSubmit}
      />
    </div>
  );
}

export default withAuth(NewPiggybankPage);
