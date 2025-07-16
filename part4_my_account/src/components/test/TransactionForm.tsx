import { ChangeEvent, useState } from 'react';
import TextField from '@shared/TextField';
import Select from '@shared/Select';
import Flex from '@shared/Flex';
import Spacing from '@shared/Spacing';
import Button from '@shared/Button';
import { getAccount, updateAccountBalance } from '@remote/account';
import { createTransaction } from '@remote/transaction';
import { Transaction } from '@models/transaction';

function TransactionForm() {
  const [formValues, setFormValues] = useState({
    userId: '',
    type: 'deposit',
    amount: '',
    displayText: '',
  });

  const handleFormValues = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormValues((pre) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    const account = await getAccount(formValues.userId);

    if (account == null) {
      window.alert('해당 유저는 계좌를 보유하고 있지 않습니다.');
      return;
    }

    if (
      formValues.type === 'withdraw' &&
      account.balance - Number(formValues.amount) < 0
    ) {
      window.alert(
        `지금 유저의 잔액은 ${account.balance}원 입니다. 잔액이 0 이하가 될 수 없어요.`,
      );
      return;
    }

    const balance =
      formValues.type === 'withdraw'
        ? account.balance - Number(formValues.amount)
        : account.balance + Number(formValues.amount);

    const newTranscation = {
      ...formValues,
      amount: Number(formValues.amount),
      date: new Date().toISOString(),
      balance,
    } as Transaction;

    // 거래 기록
    // 유저 잔고 업데이트
    await Promise.all([
      createTransaction(newTranscation),
      updateAccountBalance(formValues.userId, balance),
    ]);

    window.alert('입출금 데이터 생성 완료');
  };

  return (
    <div>
      <Flex direction="column">
        <TextField
          label="유저아이디"
          name="userId"
          value={formValues.userId}
          onChange={handleFormValues}
        />
        <Spacing size={8} />
        <Select
          name="type"
          value={formValues.type}
          options={[
            {
              label: '입금',
              value: 'deposit',
            },
            {
              label: '출금',
              value: 'withdraw',
            },
          ]}
          onChange={handleFormValues}
        />
        <Spacing size={8} />
        <TextField
          label="입출금 잔액"
          name="amount"
          value={formValues.amount}
          onChange={handleFormValues}
        />
        <Spacing size={8} />
        <TextField
          label="화면에 노출할 텍스트"
          name="displayText"
          value={formValues.displayText}
          onChange={handleFormValues}
        />
        <Spacing size={8} />
        <Button onClick={handleSubmit}>
          {formValues.type === 'deposit' ? '입금' : '출금'}
        </Button>
      </Flex>
    </div>
  );
}

export default TransactionForm;
