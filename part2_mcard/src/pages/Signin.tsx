import Form from '@components/signin/Form';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormValues } from '@models/signin';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@remote/firebase';
import { useAlertContext } from '@contexts/AlertContext';
import { FirebaseError } from 'firebase/app';

function SigninPage() {
  const { open } = useAlertContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = useCallback(
    async (formValues: FormValues) => {
      const { email, password } = formValues;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate(from, { replace: true });
      } catch (e) {
        // firebase 에러
        if (e instanceof FirebaseError) {
          if (e.code === 'auth/invalid-credential') {
            open({
              title: '계정의 정보를 다시 확인해주세요',
              onButtonClick: () => {},
            });
            return;
          }
        }
        // 일반적인 에러
        open({
          title: '잠시 후 다시 시도해주세요.',
          onButtonClick: () => {},
        });
      }
    },
    [open],
  );

  return (
    <div>
      <Form onSubmit={handleSubmit} />
    </div>
  );
}

export default SigninPage;
