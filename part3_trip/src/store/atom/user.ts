import { User } from '@models/user';
import { atom } from 'recoil';

export const userAtom = atom<User | null>({
  key: 'auth/user',
  default: null,
});
