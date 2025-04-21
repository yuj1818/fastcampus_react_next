import { useInfiniteQuery } from 'react-query';
import { getCards } from '@remote/card';
import { flatten } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
import ListRow from '@shared/ListRow';
import { useCallback } from 'react';
import Badge from '@shared/Badge';

function CardList() {
  const {
    data,
    hasNextPage = false,
    fetchNextPage,
    isFetching,
  } = useInfiniteQuery(['cards'], ({ pageParam }) => getCards(pageParam), {
    getNextPageParam: (snapshot) => snapshot.lastVisible,
  });

  const navigate = useNavigate();

  // 패치 중이거나 다음 페이지가 없으면 아무것도 하지 않음
  const loadMore = useCallback(() => {
    if (hasNextPage === false || isFetching) {
      return;
    }

    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching]);

  if (data == null) {
    return null;
  }

  const cards = flatten(data?.pages.map(({ items }) => items));

  return (
    <div>
      <InfiniteScroll
        dataLength={cards.length}
        hasMore={hasNextPage}
        loader={<></>}
        next={loadMore}
        scrollThreshold="100px"
      >
        <ul>
          {cards.map((card, idx) => {
            return (
              <ListRow
                key={card.id}
                contents={
                  <ListRow.Texts title={`${idx + 1}위`} subTitle={card.name} />
                }
                right={
                  card.payback != null ? <Badge label={card.payback} /> : null
                }
                withArrow={true}
                onClick={() => {
                  navigate(`/card/${card.id}`);
                }}
              />
            );
          })}
        </ul>
      </InfiniteScroll>
    </div>
  );
}

export default CardList;
