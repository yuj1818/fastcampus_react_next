import { forwardRef, SelectHTMLAttributes } from 'react';
import { colors } from '@styles/colorPalette';
import styled from '@emotion/styled';
import Flex from './Flex';
import Text from './Text';

export interface Option {
  label: string;
  value: string | number | undefined;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  placeholder?: string;
}

const BaseSelect = styled.select`
  height: 52px;
  background-color: ${colors.gray};
  border: none;
  border-right: 16px solid transparent;
  border-radius: 16px;
  padding: 0 16px;
  cursor: pointer;

  &:required:invalid {
    color: #c0c4c7;
  }
`;

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, placeholder, value, ...props },
  ref,
) {
  return (
    <Flex direction="column">
      <Text
        typography="t7"
        bold={true}
        color="black"
        display="inline-block"
        style={{ marginBottom: 6 }}
      >
        {label}
      </Text>
      <BaseSelect required={true} ref={ref} value={value} {...props}>
        <option disabled={true} hidden={true} value="">
          {placeholder}
        </option>
        {options.map(({ label, value }) => (
          <option key={label} value={value}>
            {label}
          </option>
        ))}
      </BaseSelect>
    </Flex>
  );
});

export default Select;
