import React, { useEffect, useRef } from 'react';
import { useModalContext } from '@contexts/ModalContext';
import { Wedding } from '@models/wedding';

function AttendCountModal({ wedding }: { wedding: Wedding }) {
  const { open, close } = useModalContext();

  const $input = useRef<HTMLInputElement>(null);

  const haveSeenModal = localStorage.getItem('@have-seen-modal');

  useEffect(() => {
    console.log('hi');
    if (haveSeenModal === 'true') {
      return;
    }

    open({
      title: `현재 참석자: ${wedding.attendCount} 명`,
      body: (
        <div>
          <input
            placeholder="참석 가능 인원을 추가해주세요"
            style={{ width: '100%', boxSizing: 'border-box' }}
            ref={$input}
            type="number"
          />
        </div>
      ),
      onLeftBtnClick: () => {
        localStorage.setItem('@have-seen-modal', 'true');
        close();
      },
      onRightBtnClick: async () => {
        if ($input.current == null) {
          return;
        }

        await fetch('http://localhost:8888/wedding', {
          method: 'PUT',
          body: JSON.stringify({
            ...wedding,
            attendCount: wedding.attendCount + Number($input.current.value),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        localStorage.setItem('@have-seen-modal', 'true');
        close();
      },
    });
  }, [open, close, wedding, haveSeenModal]);

  return null;
}

export default AttendCountModal;
