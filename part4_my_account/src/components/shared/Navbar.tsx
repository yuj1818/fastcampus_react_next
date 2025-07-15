import { css } from '@emotion/react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import Flex from './Flex';
import Button from './Button';
import { colors } from '@styles/colorPalette';

function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const showSignButton = ['/auth/signin'].includes(router.pathname) === false;

  const renderButton = useCallback(() => {
    if (session != null) {
      return (
        <Link href="/my">
          <Image
            width={40}
            height={40}
            alt=""
            src={session.user?.image ?? ''}
          />
        </Link>
      );
    }

    if (showSignButton) {
      return (
        <Link href="/auth/signin">
          <Button>로그인/회원가입</Button>
        </Link>
      );
    }

    return null;
  }, [session]);

  return (
    <Flex justify="space-between" align="center" css={navbarStyles}>
      <Link href="/">MyAccount</Link>
      {renderButton()}
    </Flex>
  );
}

const navbarStyles = css`
  padding: 10px 24px;
  position: sticky;
  top: 0;
  background-color: ${colors.white};
  z-index: 10;
  border-bottom: 1px solid ${colors.gray100};
`;

export default Navbar;
