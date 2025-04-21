import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { createPortal } from 'react-dom';
import Button from '@shared/Button';
import { colors } from '@styles/colorPalette';

interface FixedBottomButtonProps {
  label: string;
  onClick: () => void;
}

function FixedBottomButton({ label, onClick }: FixedBottomButtonProps) {
  const $portalRoot = document.getElementById('root-portal');
  if ($portalRoot == null) {
    return null;
  }

  return createPortal(
    <Container>
      <Button size="medium" css={buttonStyles} full={true} onClick={onClick}>
        {label}
      </Button>
    </Container>,
    $portalRoot,
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${colors.white};
  padding: 20px 10px 8px;
`;

const buttonStyles = css`
  border-radius: 8px;
`;

export default FixedBottomButton;
