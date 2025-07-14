import Flex from './Flex';
import Text from './Text';
import { css } from '@emotion/react';

interface TopProps {
  title: string;
  subTitle: string;
}

function Top({ title, subTitle }: TopProps) {
  return (
    <Flex direction="column" css={containerStyles}>
      <Text typography="t4" bold={true}>
        {title}
      </Text>
      <Text typography="t7">{subTitle}</Text>
    </Flex>
  );
}

export default Top;

const containerStyles = css`
  padding: 24px;
`;
