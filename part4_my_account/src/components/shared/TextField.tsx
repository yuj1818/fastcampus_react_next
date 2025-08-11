import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import Input from './Input';
import Text from './Text';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  hasError?: boolean;
  helpMessage?: React.ReactNode;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, hasError, helpMessage, ...props }, ref) {
    const [focused, setFocused] = useState(false);

    const labelColor = hasError ? 'red' : focused ? 'blue' : undefined;
    return (
      <div>
        {label ? (
          <Text
            typography="t7"
            color={labelColor}
            display="inline-block"
            style={{ marginBottom: 6 }}
          >
            {label}
          </Text>
        ) : null}

        <Input
          ref={ref}
          aria-invalid={hasError}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {helpMessage ? (
          <Text
            typography="t7"
            color={labelColor}
            display="inline-block"
            style={{ marginTop: 6, fontSize: 12 }}
          >
            {helpMessage}
          </Text>
        ) : null}
      </div>
    );
  },
);

export default TextField;
