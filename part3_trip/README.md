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
            doc(collection(store, COLLECTIONS.USER), user.uid)
          );
    
          // 이미 가입한 유저
          if (userSnapshot.exists()) {
            navigate('/')
          } else {
            const newUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoUrl: user.photoURL,
            };
      
            await setDoc(doc(collection(store, COLLECTIONS.USER), user.uid), newUser);
            
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