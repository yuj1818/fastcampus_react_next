import Apply from '@components/apply';
import useApplyCardMutation from '@components/apply/hooks/useApplyCardMutation';
import { useState } from 'react';
import usePollApplyStatus from '@components/apply/hooks/usePollApplyStatus';
import { updateApplyCard } from '@remote/apply';
import { APPLY_STATUS } from '@models/apply';
import useUser from '@hooks/auth/useUser';
import { useNavigate, useParams } from 'react-router-dom';

function ApplyPage() {
  const navigate = useNavigate();

  const [readyToPoll, setReadyToPoll] = useState(false);

  const user = useUser();
  const { id } = useParams() as { id: string };

  usePollApplyStatus({
    onSuccess: async () => {
      await updateApplyCard({
        userId: user?.uid as string,
        cardId: id,
        applyValues: {
          status: APPLY_STATUS.COMPLETE,
        },
      });
      navigate('/apply/done?success=true', { replace: true });
    },
    onError: async () => {
      await updateApplyCard({
        userId: user?.uid as string,
        cardId: id,
        applyValues: {
          status: APPLY_STATUS.REJECT,
        },
      });
      navigate('/apply/done?success=false', { replace: true });
    },
    enabled: readyToPoll,
  });

  const { mutate, isLoading: isProgressing } = useApplyCardMutation({
    onSuccess: () => {
      setReadyToPoll(true);
    },
    onError: () => {
      window.history.back();
    },
  });

  if (readyToPoll || isProgressing) {
    return <div>Loading...</div>;
  }

  return <Apply onSubmit={mutate} />;
}

export default ApplyPage;
