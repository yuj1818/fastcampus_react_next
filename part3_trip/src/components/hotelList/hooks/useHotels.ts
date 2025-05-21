import { useInfiniteQuery } from 'react-query';
import { getHotels } from '@remote/hotel';
import { useCallback } from 'react';

function useHotels() {
  const {
    data,
    hasNextPage = false,
    fetchNextPage,
    isFetching,
  } = useInfiniteQuery(['hotels'], ({ pageParam }) => getHotels(pageParam), {
    getNextPageParam: (snapshot) => {
      return snapshot.lastVisible;
    },
  });

  const loadMore = useCallback(() => {
    if (hasNextPage === false || isFetching) {
      return;
    }

    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching]);

  return { data, loadMore, isFetching, fetchNextPage };
}

export default useHotels;
