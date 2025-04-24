import Apply from '@components/apply';
import useApplyCardMutation from '@components/apply/hooks/useApplyCardMutation';

function ApplyPage() {
  const { mutate } = useApplyCardMutation({
    onSuccess: () => {
      // 값이 추가되었을 때 => 폴링 시작
    },
    onError: () => {
      window.history.back();
    },
  });

  return <Apply onSubmit={mutate} />;
}

export default ApplyPage;
