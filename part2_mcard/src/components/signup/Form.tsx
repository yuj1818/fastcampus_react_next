import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import validator from 'validator';
import Flex from '@shared/Flex';
import TextField from '@shared/TextField';
import FixedBottomButton from '@shared/FixedBottomButton';
import Spacing from '@shared/Spacing';
import { FormValues } from '@models/signup';

function Form({ onSubmit }: { onSubmit: (formValues: FormValues) => void }) {
  const [formValues, setFormValues] = useState<FormValues>({
    email: '',
    password: '',
    rePassword: '',
    name: '',
  });

  const [dirty, setDirty] = useState<Partial<FormValues>>({});

  const handleFormValues = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDirty((prev) => ({
      ...prev,
      [e.target.name]: 'true',
    }));
  }, []);

  const errors = useMemo(() => validate(formValues), [formValues]);

  const isValid = Object.keys(errors).length === 0;

  return (
    <Flex direction="column" css={formContainerStyles}>
      <TextField
        label="이메일"
        name="email"
        placeholder="olaf@gmail.com"
        value={formValues.email}
        onChange={handleFormValues}
        hasError={Boolean(dirty.email) && Boolean(errors.email)}
        helpMessage={dirty.email ? errors.email : ''}
        onBlur={handleBlur}
      />
      <Spacing size={16} />
      <TextField
        label="패스워드"
        name="password"
        type="password"
        value={formValues.password}
        onChange={handleFormValues}
        hasError={Boolean(dirty.password) && Boolean(errors.password)}
        helpMessage={dirty.password ? errors.password : ''}
        onBlur={handleBlur}
      />
      <Spacing size={16} />
      <TextField
        label="패스워드 재확인"
        name="rePassword"
        type="password"
        value={formValues.rePassword}
        onChange={handleFormValues}
        hasError={Boolean(dirty.rePassword) && Boolean(errors.rePassword)}
        helpMessage={dirty.rePassword ? errors.rePassword : ''}
        onBlur={handleBlur}
      />
      <Spacing size={16} />
      <TextField
        label="이름"
        name="name"
        placeholder="올라프"
        value={formValues.name}
        onChange={handleFormValues}
        hasError={Boolean(dirty.name) && Boolean(errors.name)}
        helpMessage={dirty.name ? errors.name : ''}
        onBlur={handleBlur}
      />
      <FixedBottomButton
        label="회원가입"
        disabled={!isValid}
        onClick={() => {
          onSubmit(formValues);
        }}
      />
    </Flex>
  );
}

const formContainerStyles = css`
  padding: 24px;
`;

function validate(formValues: FormValues) {
  let errors: Partial<FormValues> = {};

  if (validator.isEmail(formValues.email) === false) {
    errors.email = '이메일 형식을 확인해주세요';
  }

  if (formValues.password.length < 8) {
    errors.password = '비밀번호를 8글자 이상 입력해주세요';
  }

  if (formValues.rePassword.length < 8) {
    errors.rePassword = '비밀번호를 8글자 이상 입력해주세요';
  } else if (
    validator.equals(formValues.password, formValues.rePassword) === false
  ) {
    errors.rePassword = '비밀번호를 확인해주세요';
  }

  if (formValues.name.length < 2) {
    errors.name = '이름은 2글자 이상 입력해주세요';
  }

  return errors;
}

export default Form;
