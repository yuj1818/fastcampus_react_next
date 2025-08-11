import React, { ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // 오류가 있는지 여부를 추적하는 상태 변수 정의
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    // 다음 렌더링에서 폴백 UI를 표시하도록 상태 업데이트

    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 여기에서 자체 오류 로깅 서비스를 사용할 수 있습니다
    console.log({ error, errorInfo });
  }
  render() {
    // 오류가 발생했는지 확인
    if (this.state.hasError) {
      if (this.props.fallbackComponent != null) {
        return <>{this.props.fallbackComponent}</>;
      }
      // 사용자 정의 폴백 UI를 렌더링할 수 있습니다
      return (
        <div>
          <h2>알 수 없는 문제가 발생했어요</h2>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
          >
            재시도
          </button>
        </div>
      );
    }

    // 오류가 없는 경우 자식 컴포넌트를 반환

    return this.props.children;
  }
}

export default ErrorBoundary;
