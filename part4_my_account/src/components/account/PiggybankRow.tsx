import Image from 'next/image';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { differenceInDays } from 'date-fns';
import withSuspense from '@shared/hocs/withSuspense';
import { getPiggybank } from '@remote/piggybank';
import useUser from '@hooks/useUser';
import addDelimiter from '@utils/addDelimiter';
import ListRow from '@shared/ListRow';
import Flex from '@shared/Flex';
import Text from '@shared/Text';

function PiggybankRow() {
  const navigate = useRouter();
  const user = useUser();

  const { data } = useQuery(
    ['piggybank', user?.id],
    () => getPiggybank(user?.id as string),
    {
      suspense: true,
    },
  );

  if (data == null) {
    return (
      <div>
        <ul>
          <ListRow
            left={
              <Image
                src="https://cdn2.iconfinder.com/data/icons/new-year-resolutions/64/resolutions-24-512.png"
                width={40}
                height={40}
                alt=""
              />
            }
            contents={
              <ListRow.Texts
                title="저금통"
                subTitle="매일 매일 조금씩 저금하여 목표 금액을 모아보아요"
              />
            }
            withArrow={true}
            onClick={() => navigate.push('/account/piggybank/new')}
          />
        </ul>
      </div>
    );
  }

  const { balance, endDate, goalAmount } = data;
  const dday = differenceInDays(endDate, new Date());

  return (
    <div>
      <ul>
        <ListRow
          left={
            <Image
              src="https://cdn2.iconfinder.com/data/icons/new-year-resolutions/64/resolutions-24-512.png"
              width={40}
              height={40}
              alt=""
            />
          }
          contents={
            <Flex direction="column">
              <Text bold={true} typography="t4">
                D-{dday}
              </Text>
              <Text>{addDelimiter(goalAmount - balance)}원 남았어요</Text>
            </Flex>
          }
          withArrow={true}
          onClick={() => {}}
        />
      </ul>
    </div>
  );
}

export default withSuspense(PiggybankRow, { fallback: <div>로딩중...</div> });
