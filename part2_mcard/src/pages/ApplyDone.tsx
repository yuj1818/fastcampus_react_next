import { parse } from 'qs';
import Text from '@shared/Text';
import Flex from '@shared/Flex';
import FixedBottomButton from '@shared/FixedBottomButton';
import { colors } from '@styles/colorPalette';

function ApplyDone() {
  const { success } = parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as { success: string };

  return (
    <Flex
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      justify="center"
      align="center"
    >
      <Flex direction="column" align="center" style={{ gap: '16px' }}>
        {success === 'true' ? (
          <>
            <IconSuccess />
            <Text>카드가 발급되었습니다</Text>
          </>
        ) : (
          <>
            <IconFail />
            <Text>카드 발급에 실패했습니다</Text>
          </>
        )}
      </Flex>

      <FixedBottomButton
        label="확인"
        onClick={() => {
          window.history.back();
        }}
      />
    </Flex>
  );
}

function IconSuccess() {
  return (
    <svg
      width="120px"
      height="120px"
      data-name="Layer 1"
      id="Layer_1"
      viewBox="0 0 52 52"
      xmlns="http://www.w3.org/2000/svg"
      fill={colors.green}
    >
      <path d="M26,52A26,26,0,1,1,52,26,26,26,0,0,1,26,52ZM26,4A22,22,0,1,0,48,26,22,22,0,0,0,26,4Z" />
      <path d="M23,37.6A2,2,0,0,1,21.59,37l-9.2-9.19A2,2,0,0,1,15.22,25l9.19,9.19A2,2,0,0,1,23,37.6Z" />
      <path d="M23,37.6a2,2,0,0,1-1.41-3.42L36.78,19a2,2,0,0,1,2.83,2.83L24.41,37A2,2,0,0,1,23,37.6Z" />
    </svg>
  );
}

function IconFail() {
  return (
    <svg
      width="120px"
      height="120px"
      data-name="Layer 1"
      id="Layer_1"
      viewBox="0 0 52 52"
      xmlns="http://www.w3.org/2000/svg"
      fill={colors.red}
    >
      <path d="M26,0A26,26,0,1,0,52,26,26,26,0,0,0,26,0Zm0,48A22,22,0,1,1,48,26,22,22,0,0,1,26,48Z" />
      <path d="M28.83,26l8.58-8.59a2,2,0,0,0-2.82-2.82L26,23.17l-8.58-8.58a2,2,0,0,0-2.83,2.82L23.17,26l-8.58,8.58a2,2,0,1,0,2.82,2.83L26,28.83l8.59,8.58A2,2,0,0,0,36,38a2,2,0,0,0,1.42-.59,2,2,0,0,0,0-2.82Z" />
    </svg>
  );
}

export default ApplyDone;
