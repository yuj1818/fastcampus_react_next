import { getWedding } from '../api/wedding';
import { useQuery } from 'react-query';
import { Wedding } from '@models/wedding';

function useWedding() {
  const { isLoading, error, data } = useQuery<Wedding>(
    'wedding',
    () =>
      getWedding().then((res) => {
        if (res.ok === false) {
          throw new Error('청첩장 정보를 불러오지 못했습니다.');
        }

        return res.json();
      }),
    {
      suspense: true,
    },
  );

  return { wedding: data, isLoading, error };
}

export default useWedding;
