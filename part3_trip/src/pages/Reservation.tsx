import { parse } from 'qs';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useReservation from '@components/reservation/hooks/useReservation';
import Summary from '@components/reservation/Summary';
import Spacing from '@shared/Spacing';
import Form from '@components/reservation/Form';
import addDelimiter from '@utils/addDelimiter';
import useUser from '@hooks/auth/useUser';

function ReservationPage() {
  const user = useUser();
  const navigate = useNavigate();

  const { startDate, endDate, nights, roomId, hotelId } = parse(
    window.location.search,
    { ignoreQueryPrefix: true },
  ) as {
    startDate: string;
    endDate: string;
    nights: string;
    roomId: string;
    hotelId: string;
  };

  useEffect(() => {
    if (
      [user, startDate, endDate, nights, roomId, hotelId].some((param) => {
        return param == null;
      })
    ) {
      window.history.back();
    }
  }, [startDate, endDate, nights, roomId, hotelId, user]);

  const { data, isLoading, makeReservation } = useReservation({
    hotelId,
    roomId,
  });

  if (data == null || isLoading === true) {
    return null;
  }

  const { hotel, room } = data;

  const handleSubmit = async (formValues: { [key: string]: string }) => {
    console.log('formValues', formValues);
    const newReservation = {
      userId: user?.uid as string,
      hotelId,
      roomId,
      startDate,
      endDate,
      price: room.price * Number(nights),
      formValues,
    };

    await makeReservation(newReservation);

    // navigate로 이동이 제대로 되지 않아 임의로 setTimeout 적용
    // window.location.href로는 잘 이동되는데 navigate 안먹히는 이유 모르겠음
    setTimeout(() => {
      navigate(`/reservation/done?hotelName=${hotel.name}`);
    }, 0);
  };

  const buttonLabel = `${nights}박 ${addDelimiter(
    room.price * Number(nights),
  )}원 예약하기`;

  return (
    <div>
      <Summary
        hotelName={hotel.name}
        room={room}
        startDate={startDate}
        endDate={endDate}
        nights={nights}
      />
      <Spacing size={8} backgroundColor="gray100" />
      <Form
        onSubmit={handleSubmit}
        forms={hotel.forms}
        buttonLabel={buttonLabel}
      />
    </div>
  );
}

export default ReservationPage;
