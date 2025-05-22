import { CopyToClipboard } from 'react-copy-to-clipboard';
import { css } from '@emotion/react';
import Flex from '@shared/Flex';
import useShare from '@hooks/useShare';
import Spacing from '@shared/Spacing';
import Text from '@shared/Text';
import { Hotel } from '@models/hotel';

function ActionButtons({ hotel }: { hotel: Hotel }) {
  const share = useShare();

  const { name, comment, mainImageUrl } = hotel;

  return (
    <Flex css={containerStyles}>
      <Button
        label="찜하기"
        iconUrl="https://cdn4.iconfinder.com/data/icons/twitter-29/512/166_Heart_Love_Like_Twitter-512.png"
        onClick={() => {}}
      />
      <Button
        label="공유하기"
        iconUrl="https://cdn1.iconfinder.com/data/icons/rounded-social-media/512/kakao-64.png"
        onClick={() => {
          share({
            title: name,
            description: comment,
            imageUrl: mainImageUrl,
            buttonLabel: 'Trip에서 보기',
          });
        }}
      />
      <CopyToClipboard
        text={window.location.href}
        onCopy={() => {
          alert('링크가 복사되었습니다.');
        }}
      >
        <Button
          label="링크복사"
          iconUrl="https://cdn3.iconfinder.com/data/icons/feather-5/24/copy-512.png"
        />
      </CopyToClipboard>
    </Flex>
  );
}

function Button({
  label,
  iconUrl,
  onClick,
}: {
  label: string;
  iconUrl: string;
  onClick?: () => void;
}) {
  return (
    <Flex direction="column" align="center" onClick={onClick}>
      <img src={iconUrl} alt="icon" width={30} height={30} />
      <Spacing size={6} />
      <Text typography="t7">{label}</Text>
    </Flex>
  );
}

const containerStyles = css`
  padding: 24px;
  cursor: pointer;

  & * {
    flex: 1;
  }
`;

export default ActionButtons;
