# React 최적화 Part3 - 여행사 서비스

## Firestore 계층 설정

- Hotel의 하위 항목들로 room이 저장되어야 하는데, doc(collection(store, COLLECTIONS.ROOM))이면 별개의 COLLETION이 되어버림
- collection의 reference에 room의 상위 항목인 HOTEL ref를 지정하면 계층을 설정할 수 있음

  ```tsx
  import { doc, collection, writeBatch } from 'firebase/firestore';
  import { store } from '@remote/firebase';
  import Button from '@shared/Button';
  import { EVENTS, HOTEL, HOTEL_NAMES, IMAGES, ROOMS } from '@/mock/data';
  import { COLLECTIONS } from '@constants';

  function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function HotelListAddButton() {
    const batch = writeBatch(store);

    const handleButtonClick = () => {
      const hotels = HOTEL_NAMES.map((hotelName, idx) => {
        return {
          name: hotelName,
          mainImage: IMAGES[Math.floor(Math.random() * IMAGES.length)],
          images: IMAGES,
          price: random(130000, 200000),
          starRating: random(1, 5),
          ...HOTEL,
          ...(EVENTS[idx] != null && { events: EVENTS[idx] }),
        };
      });

      hotels.forEach((hotel) => {
        const hotelDocRef = doc(collection(store, COLLECTIONS.HOTEL));

        batch.set(hotelDocRef, hotel);

        ROOMS.forEach((room) => {
          const subDocRef = doc(collection(**hotelDocRef**, COLLECTIONS.ROOM));
          batch.set(subDocRef, room);
        });
      });
    };

    return <Button onClick={handleButtonClick}>호텔 리스트 추가</Button>;
  }

  export default HotelListAddButton;

  ```

## Firestore 데이터 가져오기

- react-query 사용하여 firestore에 저장되어 있는 호텔 데이터 조회
- 무한 스크롤 기능 구현하기 위해 pageParams 사용

  - pageParams가 아직 null일 때는 처음부터 10개 가져오기
  - pageParams가 존재할 때는, 마지막 요소 다음의 10개를 가져오기(startAfter)

  ```tsx
  import {
    QuerySnapshot,
    collection,
    limit,
    query,
    getDocs,
    startAfter,
  } from 'firebase/firestore';
  import { COLLECTIONS } from '@constants';
  import { store } from './firebase';

  async function getHotels(pageParams?: QuerySnapshot<unknown>) {
    const hotelQuery =
      pageParams == null
        ? query(collection(store, COLLECTIONS.HOTEL), limit(10))
        : query(
            collection(store, COLLECTIONS.HOTEL),
            startAfter(pageParams),
            limit(10),
          );

    const hotelSnapshot = await getDocs(hotelQuery);

    const items = hotelSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastVisible = hotelSnapshot.docs[hotelSnapshot.docs.length - 1];

    return { items, lastVisible };
  }
  ```

- custom hook 만들어 컴포넌트와 데이터 조회 함수 분리

  ```tsx
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
  ```

## Firebase의 실시간성 이용하여 실시간 예약 정보 가져오기

### 실시간 변화 감지하기

- `onSnapShot` 함수 사용하여 내가 보고있는 hotel의 room들의 정보들이 변하였는지 감지
  `onSnapShot`
  - 문서에 변경이 일어날 때 동작하는 이벤트
- 변한 정보들을 다시 받아와서, `useQueryClient` , `setQueryData` 사용하여 기존에 캐싱되어 있던 room 정보들을 바뀐 정보들로 변경

  ```tsx
  import { useQuery, useQueryClient } from 'react-query';
  import { getRooms } from '@remote/room';
  import { onSnapshot, collection, doc } from 'firebase/firestore';
  import { useEffect } from 'react';
  import { store } from '@remote/firebase';
  import { COLLECTIONS } from '@constants';
  import { Room } from '@models/room';

  function useRooms({ hotelId }: { hotelId: string }) {
    const client = useQueryClient();

    useEffect(() => {
      const unsubscribe = onSnapshot(
        collection(doc(store, COLLECTIONS.HOTEL, hotelId), COLLECTIONS.ROOM),
        (snapshot) => {
          const newRooms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Room),
          }));

          client.setQueryData(['rooms', hotelId], newRooms);
        },
      );

      return () => {
        unsubscribe();
      };
    }, [hotelId, client]);

    return useQuery(['rooms', hotelId], () => getRooms(hotelId));
  }

  export default useRooms;
  ```

- 언마운트 될 때, onSnapshot unscribe하여 연결 끊기

## 구글 지도 api 사용

- google maps platform에서 계정 인증 및 등록
- 키 및 사용자 인증 정보에서 api key 가져와 `.env`에 등록
- `@react-google-maps/api` 라이브러리 사용하여 지도 렌더링
    <aside>
    ⚠️
    
    Marker 는 AdvancedMarkerElement로 변경해서 사용해야 하나, 임시로 Marker 사용
    
    </aside>
    
    ```tsx
    import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
    import Flex from '@shared/Flex';
    import Text from '@shared/Text';
    import { Hotel } from '@models/hotel';
    
    function Map({ location }: { location: Hotel['location'] }) {
      const {
        directions,
        pointGeolocation: { x, y },
      } = location;
    
      const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY as string,
      });
    
      if (isLoaded === false) {
        return null;
      }
    
      return (
        <Flex direction="column" style={{ padding: '24px' }}>
          <Text bold={true} typography="t4">
            기본 정보
          </Text>
          <GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: '250px',
              margin: '16px 0',
              boxSizing: 'border-box',
            }}
            center={{
              lat: y,
              lng: x,
            }}
            zoom={15}
          >
            <Marker position={{ lat: y, lng: x }} />
          </GoogleMap>
          <Text typography="t6">{directions}</Text>
        </Flex>
      );
    }
    
    export default Map;
    
    ```

## 구글 로그인

- 구글 소셜 로그인을 통해 계정 정보를 가져와 firestore에 저장
- 저장된 uid 기준으로 중복 유저 로그인 처리

### 구글 로그인 기능 구현

- firebase/auth의 signInWithPopup, GoogleAuthProvider 사용하여 구현
- signInWithPopup에서 로그인 성공하면 계정 정보 받아옴
- uid 기준으로 store에 저장되어 있는 데이터가 있는지 (기존 회원인지 신규 회원인지) 확인
  - 분기 처리하여 신규 회원만 store에 저장
- 코드

  ```tsx
  import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
  import { useCallback } from 'react';
  import { auth, store } from '@remote/firebase';
  import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
  import { COLLECTIONS } from '@constants';
  import { useNavigate } from 'react-router-dom';
  import { FirebaseError } from 'firebase/app';

  function useGoogleSignin() {
    const navigate = useNavigate();

    const signin = useCallback(async () => {
      const provider = new GoogleAuthProvider();

      try {
        const { user } = await signInWithPopup(auth, provider);

        const userSnapshot = await getDoc(
          doc(collection(store, COLLECTIONS.USER), user.uid),
        );

        // 이미 가입한 유저
        if (userSnapshot.exists()) {
          navigate('/');
        } else {
          const newUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoUrl: user.photoURL,
          };

          await setDoc(
            doc(collection(store, COLLECTIONS.USER), user.uid),
            newUser,
          );

          navigate('/');
        }
      } catch (error) {
        if (error instanceof FirebaseError) {
          if (error.code === 'auth/popup-closed-by-user') {
            return;
          }
        }

        throw new Error('fail to signin');
      }
    }, [navigate]);

    const signout = useCallback(() => {
      signOut(auth);
    }, []);

    return { signin, signout };
  }

  export default useGoogleSignin;
  ```

### AuthGuard 구현

- recoil과 onAuthStateChanged 사용하여 인증된 사용자인지의 여부를 전역 상태 관리
  - onAuthStateChanged를 통해 로그인/로그아웃 할 때 마다 user 상태를 변경
- 코드

  ```tsx
  import { useState } from 'react';
  import { onAuthStateChanged } from 'firebase/auth';
  import { useSetRecoilState } from 'recoil';
  import { auth } from '@remote/firebase';
  import { userAtom } from '@store/atom/user';

  function AuthGuard({ children }: { children: React.ReactNode }) {
    const [initialize, setInitialize] = useState(false);
    const setUser = useSetRecoilState(userAtom);

    onAuthStateChanged(auth, (user) => {
      if (user == null) {
        setUser(null);
      } else {
        setUser({
          uid: user.uid,
          email: user.email ?? '',
          displayName: user.displayName ?? '',
          photoUrl: user.photoURL ?? '',
        });
      }

      setInitialize(true);
    });

    if (initialize === false) {
      return null;
    }

    return <>{children}</>;
  }

  export default AuthGuard;
  ```

  ## 찜하기 기능 구현

### 찜하기

- `useLike` 커스텀 훅 구현
  - 현재의 사용자 id를 기준으로 like 정보 조회
    - 사용자 id를 기준으로 사용하기 때문에 로그인하지 않은 사용자는 찜하기 기능을 사용할 수 없음
  - 해당 like 목록에서 hotelId가 일치하는 것이 있으면 해당 호텔을 찜했다고 디스플레이
- `useMutation` 사용하여 찜하기를 토글할 수 있도록 구현
  - onSuccess 했을 때, `invalidateQueries` 사용하여 데이터를 만료 시켜 refetching 될 수 있도록 함
- 코드

  ```tsx
  import { useMutation, useQuery, useQueryClient } from 'react-query';
  import { getLikes, toggleLike } from '@remote/like';
  import useUser from '@hooks/auth/useUser';
  import { Hotel } from '@models/hotel';
  import { useAlertContext } from '@contexts/AlertContext';
  import { useNavigate } from 'react-router-dom';

  function useLike() {
    const user = useUser();
    const { open } = useAlertContext();
    const navigate = useNavigate();
    const client = useQueryClient();

    const { data } = useQuery(
      ['likes'],
      () => getLikes({ userId: user?.uid as string }),
      {
        enabled: user != null,
      },
    );

    const { mutate } = useMutation(
      ({ hotel }: { hotel: Pick<Hotel, 'name' | 'id' | 'mainImageUrl'> }) => {
        if (user === null) {
          throw new Error('로그인필요');
        }
        return toggleLike({ hotel, userId: user.uid });
      },
      {
        onSuccess: () => {
          client.invalidateQueries(['likes']);
        },
        onError: (e: Error) => {
          if (e.message === '로그인필요') {
            open({
              title: '로그인이 필요한 기능입니다.',
              onButtonClick: () => {
                navigate('/signin');
              },
            });

            return;
          }

          open({
            title: '알 수 없는 에러가 발생했습니다. 잠시후 다시 시도해주세요',
            onButtonClick: () => {},
          });
        },
      },
    );

    return { data, mutate };
  }

  export default useLike;
  ```

### 찜 목록 및 순서 변경

- `react-beautiful-dnd` 사용하여 드래그&드롭 구현

  - `DragDropContext`
    - 드래그/드롭 전체 영역을 감싸는 컴포넌트
  - `Droppable`
    - 드롭 가능한 영역
  - `Draggable`
    - 개별 항목
  - 코드

    ```tsx
    import ListRow from '@shared/ListRow';
    import FixedBottomButton from '@shared/FixedBottomButton';
    import {
      DragDropContext,
      Droppable,
      Draggable,
      DraggableProps,
      DropResult,
      DroppableProps,
    } from 'react-beautiful-dnd';
    import { useEffect, useState } from 'react';
    import useEditLike from '@components/settings/like/hooks/useEditLike';

    function LikePage() {
      const { data, isEdit, reorder, save } = useEditLike();

      const handleDragEndDrop = (result: DropResult) => {
        if (result.destination == null) {
          return;
        }

        const from = result.source.index;
        const to = result.destination?.index;

        reorder(from, to);
      };

      return (
        <div>
          <DragDropContext onDragEnd={handleDragEndDrop}>
            <StrictModeDroppable droppableId="likes">
              {(droppableProps) => (
                <ul
                  ref={droppableProps.innerRef}
                  {...droppableProps.droppableProps}
                >
                  {data?.map((like, index) => {
                    return (
                      <Draggable
                        key={like.id}
                        draggableId={like.id}
                        index={index}
                      >
                        {(draggableProps) => (
                          <li
                            ref={draggableProps.innerRef}
                            {...draggableProps.draggableProps}
                            {...draggableProps.dragHandleProps}
                          >
                            <ListRow
                              as="div"
                              contents={
                                <ListRow.Texts
                                  title={like.order}
                                  subTitle={like.hotelName}
                                />
                              }
                            />
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                </ul>
              )}
            </StrictModeDroppable>
          </DragDropContext>
          {isEdit ? (
            <FixedBottomButton label="저장하기" onClick={save} />
          ) : null}
        </div>
      );
    }

    function StrictModeDroppable({ children, ...props }: DroppableProps) {
      const [enabled, setEnabled] = useState(false);

      useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));

        return () => {
          cancelAnimationFrame(animation);
          setEnabled(false);
        };
      }, []);

      if (enabled === false) {
        return null;
      }

      return <Droppable {...props}>{children}</Droppable>;
    }

    export default LikePage;
    ```

- `useEditLike` 커스텀 훅 구현하여 찜 목록 조회 및 순서 변경 로직을 구현

  - useLike로 찜 목록을 가져와 updatedLikes에 복사
  - 사용자가 항목을 드래그 하면 from, to를 prop으로 reorder 함수 호출
    - from, to 기준으로 updatedLikes 상태 변경
    - reorder가 호출되는 순간 isEdit이 true로 변경되며 저장하기 버튼 활성화
  - 저장하기를 누르면 save 함수 호출
    1. 서버에 updatedLikes 저장
    2. setQueriesData 사용하여 캐싱되어 있던 likes 데이터를 updatedLikes로 업데이트
    3. isEdit을 false로 변경하여 저장하기 버튼 비활성화
  - 코드

    ```tsx
    import { Like } from '@models/like';
    import useLike from '@hooks/like/useLike';
    import { useCallback, useState, useEffect } from 'react';
    import { updateOrder } from '@remote/like';
    import { useAlertContext } from '@contexts/AlertContext';
    import { useQueryClient } from 'react-query';

    function useEditLike() {
      const { data = [] } = useLike();
      const [updatedLikes, setUpdatedLikes] = useState<Like[]>([]);
      const [isEdit, setIsEdit] = useState(false);
      const { open } = useAlertContext();
      const client = useQueryClient();

      useEffect(() => {
        if (data != null) {
          setUpdatedLikes(data);
        }
      }, [data]);

      const reorder = useCallback((from: number, to: number) => {
        setIsEdit(true);
        setUpdatedLikes((prev) => {
          const newItems = [...prev];

          const [fromItem] = newItems.splice(from, 1);

          if (fromItem != null) {
            newItems.splice(to, 0, fromItem);
          }

          newItems.forEach((like, index) => {
            like.order = index + 1;
          });

          return newItems;
        });
      }, []);

      const save = async () => {
        try {
          await updateOrder(updatedLikes);
          client.setQueriesData(['likes'], updatedLikes);
          setIsEdit(false);
        } catch (e) {
          open({
            title: '알 수 없는 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
            onButtonClick: () => {
              setIsEdit(false);
            },
          });
        }
      };

      return { data: isEdit ? updatedLikes : data, isEdit, reorder, save };
    }

    export default useEditLike;
    ```

## 리뷰 작성/수정/삭제 기능 구현

- `useReview` 커스텀 훅을 통해 리뷰 CRUD 기능 구현

  - 작성/수정은 mutateAsync 사용하여 textFiles 초기화 비동기 처리
  - `invalidateQueries`로 실시간 데이터 갱신 처리
  - 코드

    ```tsx
    import { useQuery, useMutation, useQueryClient } from 'react-query';
    import {
      getReviews,
      removeReview,
      writeReview,
      updateReview,
    } from '@remote/review';
    import useUser from '@hooks/auth/useUser';

    function useReview({ hotelId }: { hotelId: string }) {
      const user = useUser();
      const client = useQueryClient();

      const { data, isLoading } = useQuery(['reviews', hotelId], () =>
        getReviews({ hotelId }),
      );

      const { mutateAsync: write } = useMutation(
        async (text: string) => {
          const newReview = {
            createdAt: new Date(),
            hotelId,
            userId: user?.uid as string,
            text,
          };

          await writeReview(newReview);

          return true;
        },
        {
          onSuccess: () => {
            client.invalidateQueries(['reviews', hotelId]);
          },
        },
      );

      const { mutate: remove } = useMutation(
        ({ reviewId, hotelId }: { reviewId: string; hotelId: string }) => {
          return removeReview({ reviewId, hotelId });
        },
        {
          onSuccess: () => {
            client.invalidateQueries(['reviews', hotelId]);
          },
        },
      );

      const { mutateAsync: update } = useMutation(
        async ({
          reviewId,
          hotelId,
          text,
        }: {
          reviewId: string;
          hotelId: string;
          text: string;
        }) => {
          await updateReview({ reviewId, hotelId, text });

          return true;
        },
        {
          onSuccess: () => {
            client.invalidateQueries(['reviews', hotelId]);
          },
        },
      );
      return { data, isLoading, write, remove, update };
    }

    export default useReview;
    ```

- 로그인 유저만 작성 가능, 본인의 리뷰에만 수정/삭제 가능
- Firestore의 서브 컬렉션 구조 사용 (`HOTEL/{hotelId}/REVIEW`)

  - 작성자 정보는 별도로 User 컬렉션에서 조회 후 병합
  - 동일한 유저 정보 반복 조회 방지를 위해 userMap 캐시 처리
  - 코드

    ```tsx
    export async function getReviews({ hotelId }: { hotelId: string }) {
      const hotelRef = doc(store, COLLECTIONS.HOTEL, hotelId);
      const reviewQuery = query(
        collection(hotelRef, COLLECTIONS.REVIEW),
        orderBy('createdAt', 'desc'),
      );

      const reviewSnapshot = await getDocs(reviewQuery);

      const reviews = reviewSnapshot.docs.map((doc) => {
        const review = doc.data();

        return {
          id: doc.id,
          ...review,
          createdAt: review.createdAt.toDate() as Date,
        } as Review;
      });

      const userMap: {
        [key: string]: User;
      } = {};
      const results: Array<Review & { user: User }> = [];
      s;
      for (let review of reviews) {
        const cachedUser = userMap[review.userId];

        if (cachedUser == null) {
          const userSnapshot = await getDoc(
            doc(collection(store, COLLECTIONS.USER), review.userId),
          );
          const user = userSnapshot.data() as User;

          userMap[review.userId] = user;

          results.push({
            ...review,
            user,
          });
        } else {
          results.push({
            ...review,
            user: cachedUser,
            sssssssssss,
          });
        }
      }

      return results;
    }
    ```

## 프로젝트 최적화

### 리소스 캐시

- `캐시`
    - 자주 사용되는 데이터나 리소스 또는 무거운 연산의 결과등을 빠르게 접근 할 수 있도록 저장해두는 것
    - 데이터 접근 시간 단축 가능
    - 서버의 부하/네트워크 비용 절감
    
    |  | 메모리 캐시 (RAM) | 디스크 캐시 (하드/SSD) |
    | --- | --- | --- |
    | 속도 | 빠름 | RAM 보다 느림 |
    | 용량 | 작음 | 큼 |
    | 휘발성 | O | X |
    | 방문시 | 먼저 확인 | RAM 확인 후 |
- HTTP 헤더를 통해서 캐시 동작 제어 가능
    - `no-store`
        - 캐시를 사용하지 않겠다.
    - `no-cache`
        - 리소스를 사용하기 전에 항상 원래의 서버에 재검증을 요청
    - `public`
        - 공유 캐시
        - 중간에 거치는 프록시 서버나 CDN 등에 캐시될 수 있음
    - `private`
        - 공유 캐시에 저장되어서는 안됨
    - `max-age`
        - 캐시가 유효한 시간

### 코드 스플리팅

- 커다란 번들을 작은 여러 개의 청크로 나누는 과정
- 유저가 필요하지 않은 코드들을 다운 받지 않도록 함
- lazy loading 적용 전
    
    ![image.png](https://github.com/user-attachments/assets/52a7f7d9-c61c-41c2-873f-95caf0a9739e)
    
- lazy loading 적용 후
    
    ![image.png](https://github.com/user-attachments/assets/c38ae6da-b3b9-4cca-bc16-feba52c0b407)
    

### 대용량 리스트

- `virtuoso` 라이브러리 사용
    - 보이는 요소(사용자의 뷰포트 안에 들어온 요소)만 렌더링
    - Beautiful DND 사용하여 대용량 찜 목록 Drag&Drop 최적화
- 코드
    
    ```tsx
    <ul
      ref={droppableProps.innerRef}
      {...droppableProps.droppableProps}
    >
      <Virtuoso
        useWindowScroll
        increaseViewportBy={0}
        itemContent={(index, like) => {
          return (
            <Draggable
              key={like.id}
              draggableId={like.id}
              index={index}
            >
              {(draggableProps) => (
                <li
                  ref={draggableProps.innerRef}
                  {...draggableProps.draggableProps}
                  {...draggableProps.dragHandleProps}
                >
                  <ListRow
                    as="div"
                    contents={
                      <ListRow.Texts
                        title={like.order}
                        subTitle={like.hotelName}
                      />
                    }
                  />
                </li>
              )}
            </Draggable>
          );
        }}
        data={mocks}
      ></Virtuoso>
    </ul>
    ```
    

### 애니메이션 최적화

- ProgressBar 구현에서 `setInterval`과 `requestAnimationFrame` 차이
    - `setInterval`
        - width 속성을 직접 건드려 레이아웃을 다시 계산하도록 함
        - 레이아웃을 자주 변경시키면 계산 시간이 오래 걸려 원하는 시간 보다 빠르거나 늦게 실행될 수 있음
        - 프레임 드랍 발생해 일정하지 않게 증가
    - `requestAnimationFrame`
        - 브라우저의 렌더링 주기와 동기화되어 실행
        - 일정하게 증가
- 레이아웃 변경이 일어나지 않게 requestAnimationFrame사용하여 tranform으로 progressBar 애니메이션 생성
    - 코드
        
        ```tsx
        import { useEffect, useState, useRef } from 'react';
        import { SerializedStyles } from '@emotion/react';
        import { Colors, colors } from '@styles/colorPalette';
        
        function ScrollProgressBar({
          style,
          color = 'blue980',
        }: {
          style?: SerializedStyles;
          color?: Colors;
        }) {
          const [progress, setProgress] = useState(0);
          const rafRef = useRef<number | null>(null);
        
          useEffect(() => {
            const scroll = () => {
              const scrollTop = document.documentElement.scrollTop;
              const height =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;
        
              if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
              }
        
              rafRef.current = requestAnimationFrame(() => {
                setProgress(scrollTop / height);
              });
            };
        
            window.addEventListener('scroll', scroll);
        
            return () => {
              if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
              }
        
              window.removeEventListener('scroll', scroll);
            };
          }, []);
        
          return (
            <div
              css={style}
              style={{
                transform: `scaleX(${progress})`,
                transformOrigin: 'left',
                backgroundColor: colors[color],
                height: 8,
              }}
            ></div>
          );
        }
        
        export default ScrollProgressBar;
        
        ```
        

### 검색엔진 최적화(SEO)

- 우리의 웹사이트가 검색엔진 결과 페이지에서 더 높은 위치를 차지할 수 있도록 그 내용과 구조를 최적화하는 과정
- 높은 위치를 차지하면 좋은 이유
    - 더 많은 클릭을 유도
    - 신뢰성
    - 경쟁 우위
- 클라이언트 사이드 렌더링은 우위를 차지하기 어렵기 때문에 보통 SEO는 서버 사이드 렌더링으로 구현하는 것이 일반적
    - 클라이언트 사이드 렌더링에서는 메타 태그를 추가적으로 넣음으로써 최소한의 SEO 가능
- `react-helmet-async` 라이브러리 사용하여 동적으로 헤드의 메타 태그를 변경
    - 코드
        
        ```tsx
        import { Helmet } from 'react-helmet-async';
        
        interface SEOProps {
          title: string;
          description: string;
          image: string;
        }
        
        function SEO({ title, description, image }: SEOProps) {
          return (
            <Helmet>
              <title>{title}</title>
              <meta name="description" content={description} />
              <meta property="og:type" content="website" />
              <meta property="og:title" content={title} />
              <meta property="og:image" content={image} />
              <meta property="og:image:width" content="260" />
              <meta property="og:image:height" content="260" />
              <meta property="og:description" content={description} />
              <meta property="og:locale" content="ko_KR" />
            </Helmet>
          );
        }
        
        export default SEO;
        
        ```
        

### HOC 이용하여 로딩 처리

- `High Order Component`
    - 컴포넌트를 인자로 받아 새로운 컴포넌트를 반환하는 함수
    - 반복되는 공통된 로직들을 HOC로 분리하여 재사용 가능
    - 코드
        - useQuery 사용하는 곳에 suspense: true 추가해줘야 함
        
        ```tsx
        import { Suspense, ComponentType, ReactNode } from 'react';
        
        function withSuspense<Props = Record<string, never>>(
          WrappedComponent: ComponentType<Props>,
          options: { fallback: ReactNode },
        ) {
          return (props: Props) => {
            return (
              <Suspense fallback={options.fallback}>
                <WrappedComponent {...(props as any)} />
              </Suspense>
            );
          };
        }
        
        export default withSuspense;
        ```
        

### 이미지 lazy loading

- 사용자의 뷰포트 안에 있는 이미지 요소들만 로드할 수 있도록하여 성능 최적화
- `react-lazy-load-image-component` 라이브러리 사용하여 구현

## Github Actions CI/CD

### Github Actions

- Repository에 대한 이벤트를 이용해서 빌드, 테스트 및 배포 파이프라인을 자동화할 수 있는 CI/CD 플랫폼
- `CI (Continuous Integration, 지속적 통합)`
    - 코드를 메인에 merge 요청 ⇒ 검사 (test, lint, build 테스트) ⇒ 통과한 코드만 merge
- `CD (Continuous Deployment)`
    - CI 과정을 거친 안정화된 코드를 자동 배포

### CI/CD 설정

- root 디렉토리에 .github/workflows 폴더 생성
- `ci.yml`
    - 안정화된 코드인지 테스트 후, merge 가능
    
    ```
    name: CI
    
    on: [pull_request]
    
    jobs:
      lint:
        name: Lint
        runs-on: ubuntu-latest
    
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v2
            with:
              node-version: '18'
          - run: yarn install
          - run: yarn lint
      build:
        name: Build
        runs-on: ubuntu-latest
    
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v2
            with:
              node-version: '18'
          - run: yarn install
          - run: CI='false' yarn build
    ```
    
- `cd.yml`
    - vercel로 배포하여 자동 배포되도록 설정
    - github settings에서 vercel 관련 secret key 값 설정
    
    ```
    name: CD
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    on:
      push:
        branches:
          - master
    jobs:
      Deploy-Production:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v2
          - name: Install Vercel CLI
            run: npm install --global vercel@latest
          - name: Pull Vercel Environment Information
            run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          - name: Build Project Artifacts
            run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          - name: Deploy Project Artifacts to Vercel
            run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
    
    ```