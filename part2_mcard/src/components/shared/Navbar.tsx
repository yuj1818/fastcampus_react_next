import { css } from '@emotion/react';
import Flex from '@shared/Flex';
import { Link, useLocation } from 'react-router-dom';
import Button from '@shared/Button';
import { colors } from '@styles/colorPalette';
import useUser from '@hooks/auth/useUser';
import { useCallback } from 'react';
import MyImage from '@components/my/MyImage';
function Navbar() {
  const location = useLocation();
  const showSignButton =
    ['/signup', '/signin'].includes(location.pathname) === false;

  const user = useUser();

  const renderButton = useCallback(() => {
    if (user != null) {
      return (
        <Link to="/my">
          <MyImage />
        </Link>
      );
    }

    if (showSignButton) {
      return (
        <Link to="/signin">
          <Button>로그인/회원가입</Button>
        </Link>
      );
    }

    return null;
  }, [user, showSignButton]);

  return (
    <Flex justify="space-between" align="center" css={navbarContainerStyles}>
      <Link to="/">
        <Logo />
      </Link>
      {renderButton()}
    </Flex>
  );
}

function Logo() {
  return (
    <svg
      baseProfile="tiny"
      height="32px"
      id="Layer_1"
      version="1.2"
      viewBox="0 0 24 24"
      width="32px"
      fill={colors.blue}
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12,3c0,0-6.186,5.34-9.643,8.232C2.154,11.416,2,11.684,2,12c0,0.553,0.447,1,1,1h2v7c0,0.553,0.447,1,1,1h3  c0.553,0,1-0.448,1-1v-4h4v4c0,0.552,0.447,1,1,1h3c0.553,0,1-0.447,1-1v-7h2c0.553,0,1-0.447,1-1c0-0.316-0.154-0.584-0.383-0.768  C18.184,8.34,12,3,12,3z" />
    </svg>
  );
}

const navbarContainerStyles = css`
  padding: 10px 24px;
  position: sticky;
  top: 0;
  background-color: ${colors.white};
  z-index: 10;
  border-bottom: 1px solid ${colors.grey};
`;

export default Navbar;
