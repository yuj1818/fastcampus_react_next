import Modal from '@shared/Modal';
import React, {
  ComponentProps,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type ModalProps = ComponentProps<typeof Modal>;
type ModalOptions = Omit<ModalProps, 'open'>;

interface ModalContextValue {
  open: (options: ModalOptions) => void;
  close: () => void;
}

const Context = createContext<ModalContextValue | undefined>(undefined);

const defaultValues: ModalProps = {
  open: false,
  body: null,
  onRightBtnClick: () => {},
  onLeftBtnClick: () => {},
};

export function ModalContext({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<ModalProps>(defaultValues);

  const $portal_root = document.getElementById('root-portal');

  const open = useCallback((options: ModalOptions) => {
    setModalState({ ...options, open: true });
  }, []);

  const close = useCallback(() => {
    setModalState(defaultValues);
  }, []);

  // open, close는 usecallback에 의해 캐싱되었으므로 ModalContext 컴포넌트가 업데이트되면서 리렌더링 되더라도 해당 함수는 항상 새로 만들어지지 않음
  const values = useMemo(
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  return (
    <Context.Provider value={values}>
      {children}
      {$portal_root != null
        ? createPortal(<Modal {...modalState} />, $portal_root)
        : null}
    </Context.Provider>
  );
}

export function useModalContext() {
  const values = useContext(Context);

  if (values == null) {
    throw new Error('ModalContext 안에서 사용해주세요');
  }

  return values;
}
