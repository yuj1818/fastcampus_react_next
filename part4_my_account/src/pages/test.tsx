import CardListAddButton from '@/components/test/CardListAddButton';
import EventBannerAddButton from '@components/test/EventBannerAddButton';
import EventForm from '@components/test/EventForm';
import TransactionForm from '@components/test/TransactionForm';
import Flex from '@shared/Flex';
import Text from '@shared/Text';
import Spacing from '@shared/Spacing';

function TestPage() {
  return (
    <Flex direction="column">
      <Text bold={true}>배너</Text>
      <EventBannerAddButton />
      <Spacing
        size={8}
        backgroundColor="gray100"
        style={{ margin: '20px 0' }}
      />
      <Text bold={true}>카드</Text>
      <CardListAddButton />
      <Spacing
        size={8}
        backgroundColor="gray100"
        style={{ margin: '20px 0' }}
      />
      <Text bold={true}>이벤트 에디터</Text>
      <EventForm />
      <Spacing
        size={8}
        backgroundColor="gray100"
        style={{ margin: '20px 0' }}
      />
      <Text bold={true}>입출금 테스트</Text>
      <TransactionForm />
    </Flex>
  );
}

export default TestPage;
