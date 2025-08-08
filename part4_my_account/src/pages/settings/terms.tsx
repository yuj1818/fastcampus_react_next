import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';
import {
  dehydrate,
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
} from 'react-query';
import { getTerms } from '@remote/account';
import { User } from '@models/user';
import useUser from '@hooks/useUser';
import { useMemo } from 'react';
import { TERMS } from '@/constants/account';
import Top from '@shared/Top';
import Text from '@shared/Text';
import ListRow from '@shared/ListRow';
import Button from '@shared/Button';
import { updateTerms } from '@remote/account';

function TermsPage() {
  const user = useUser();
  const client = useQueryClient();
  const { data } = useQuery(
    ['terms', user?.id],
    () => getTerms(user?.id as string),
    {
      enabled: user != null,
    },
  );

  const { mutate, isLoading } = useMutation(
    (termIds: string[]) => updateTerms(user?.id as string, termIds),
    {
      onSuccess: () => {
        // 캐시 갱신
        client.invalidateQueries(['terms', user?.id]);
      },
      onError: () => {},
    },
  );

  const agreedTermList = useMemo(() => {
    if (data == null) {
      return null;
    }

    const allAgreedTermList = TERMS.filter(({ id }) =>
      data.termIds.includes(id),
    );

    const mandatoryTermList = allAgreedTermList.filter(
      ({ mandatory }) => mandatory === true,
    );
    const optionTermList = allAgreedTermList.filter(
      ({ mandatory }) => mandatory === false,
    );

    return { mandatoryTermList, optionTermList };
  }, [data]);

  const handleDisagree = (selectedTermId: string) => {
    const updatedTermIds = data?.termIds.filter(
      (termId) => termId !== selectedTermId,
    );

    if (updatedTermIds != null) {
      mutate(updatedTermIds);
    }
  };

  return (
    <div>
      <Top title="약관" subTitle="약관 리스트 및 철회" />
      {agreedTermList == null ? (
        <Text>동의한 약관 목록이 없습니다.</Text>
      ) : (
        <ul>
          {agreedTermList.mandatoryTermList.map((term) => (
            <ListRow
              key={term.id}
              contents={
                <ListRow.Texts title={`[필수] ${term.title}`} subTitle="" />
              }
            />
          ))}
          {agreedTermList.optionTermList.map((term) => (
            <ListRow
              key={term.id}
              contents={
                <ListRow.Texts title={`[선택] ${term.title}`} subTitle="" />
              }
              right={
                <Button
                  onClick={() => handleDisagree(term.id)}
                  disabled={isLoading === true}
                >
                  철회
                </Button>
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (session != null && session.user != null) {
    const client = new QueryClient();

    await client.prefetchQuery(['terms', (session.user as User).id], () =>
      getTerms((session.user as User).id),
    );

    return {
      props: {
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(client))),
      },
    };
  }

  return {
    props: {},
  };
}

export default TermsPage;
