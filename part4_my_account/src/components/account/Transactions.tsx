import { parseISO, format } from 'date-fns';
import Link from 'next/link';
import useTransactions from './hooks/useTransactions';
import addDelimiter from '@/utils/addDelimiter';
import withSuspense from '@shared/hocs/withSuspense';
import Text from '@shared/Text';
import Flex from '@shared/Flex';
import ListRow from '@shared/ListRow';
import Button from '@shared/Button';

function Transactions() {
  const { data } = useTransactions({ suspense: true });

  const transactions = data?.pages
    .map(({ items }) => items)
    .flat()
    .slice(0, 5);

  return (
    <div>
      <Text bold={true} style={{ padding: 24 }}>
        입출금 내역
      </Text>
      {transactions?.length === 0 ? (
        <Flex style={{ padding: 24 }}>
          <Text>아직 입출금 내역이 없어요</Text>
        </Flex>
      ) : (
        <ul>
          {transactions?.map((transaction) => {
            const isDeposit = transaction.type === 'deposit';

            return (
              <ListRow
                key={transaction.id}
                contents={
                  <ListRow.Texts
                    title={transaction.displayText}
                    subTitle={format(
                      parseISO(transaction.date),
                      'yyyy-MM-dd HH:mm:SS',
                    )}
                  />
                }
                right={
                  <Flex direction="column" align="flex-end">
                    <Text color={isDeposit ? 'blue' : 'red'} bold={true}>
                      {isDeposit ? '+' : '-'} {addDelimiter(transaction.amount)}
                      원
                    </Text>
                    <Text>{addDelimiter(transaction.balance)}원</Text>
                  </Flex>
                }
              />
            );
          })}
        </ul>
      )}
      <div style={{ padding: '0 24px' }}>
        <Link href="/account/transactions">
          <Button full={true} size="medium" weak={true}>
            자세히 보기
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default withSuspense(Transactions, { fallback: <div>로딩중...</div> });
