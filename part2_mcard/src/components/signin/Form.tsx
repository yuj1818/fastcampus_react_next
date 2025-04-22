import Flex from '@shared/Flex';
import TextField from '@shared/TextField';
import Button from '@shared/Button';
import Spacing from '@shared/Spacing';
import { css } from '@emotion/react';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import Text from '@shared/Text';
import { Link } from 'react-router-dom';
import { colors } from '@styles/colorPalette';
import validator from 'validator';
import { FormValues } from '@models/signin';

function Form() {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
        onChange={handleChange}
        value={formValues.email}
      />
      <Spacing size={16} />
      <TextField
        label="패스워드"
        type="password"
        name="password"
        onChange={handleChange}
        value={formValues.password}
      />
      <Spacing size={32} />
      <Button size="medium" disabled={!isValid}>
        로그인
      </Button>
      <Spacing size={12} />
      <Link to="/signup" css={linkStyles}>
        <Text typography="t7">아직 계정이 없으신가요?</Text>
      </Link>
    </Flex>
  );
}

const formContainerStyles = css`
  padding: 24px;
`;

const linkStyles = css`
  text-align: center;

  & > span:hover {
    color: ${colors.blue};
  }
`;

function validate(formValues: FormValues) {
  let errors: Partial<FormValues> = {};

  if (validator.isEmail(formValues.email) === false) {
    errors.email = '이메일 형식을 확인해주세요';
  }

  if (formValues.password.length < 8) {
    errors.password = '비밀번호를 8글자 이상 입력해주세요';
  }

  return errors;
}

export default Form;
