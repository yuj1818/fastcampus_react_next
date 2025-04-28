import useUser from '@hooks/auth/useUser';
import styled from '@emotion/styled';
import { getAuth, updateProfile } from 'firebase/auth';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { app, store } from '@remote/firebase';
import { ChangeEvent } from 'react';
import { uploadProfileImage } from '@remote/my';
import { COLLECTIONS } from '@constants';
import { userAtom } from '@atoms/user';
import { useSetRecoilState } from 'recoil';

function MyImage({
  size = 40,
  mode = 'default',
}: {
  size?: number;
  mode?: 'default' | 'upload';
}) {
  const user = useUser();
  const setUser = useSetRecoilState(userAtom);

  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    const currentUser = getAuth(app).currentUser;

    if (files == null || user == null || currentUser == null) {
      return;
    }

    const uploaded = await uploadProfileImage(files[0]);
    await updateProfile(currentUser, {
      photoURL: uploaded.url,
    });

    await updateDoc(doc(collection(store, COLLECTIONS.USER), currentUser.uid), {
      photoUrl: uploaded.url,
    });

    setUser({
      ...user,
      photoURL: uploaded.url,
    });
  };

  return (
    <Container>
      <img
        src={
          user?.photoURL ||
          'https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-64.png'
        }
        alt="유저의 이미지"
        width={size}
        height={size}
      />
      {mode === 'upload' ? (
        <input type="file" accept="image/*" onChange={handleUploadImage} />
      ) : null}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;

  & img {
    border-radius: 100%;
  }

  & input[type='file'] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

export default MyImage;
