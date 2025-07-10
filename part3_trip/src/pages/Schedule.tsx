import RangePicker from '@shared/RangePicker';
import qs from 'qs';
import { useEffect, useState } from 'react';
import FixedBottomButton from '@shared/FixedBottomButton';
import { useNavigate } from 'react-router-dom';

function SchedulePage() {
  const navigate = useNavigate();

  const { roomId = '', hotelId = '' } = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {
    roomId: string;
    hotelId: string;
  };

  const [selectedDate, setSelectedDate] = useState<{
    startDate?: string;
    endDate?: string;
    nights: number;
  }>({
    startDate: undefined,
    endDate: undefined,
    nights: 0,
  });

  useEffect(() => {
    if (hotelId == '' || roomId == '') {
      navigate(-1);
    }
  }, [roomId, hotelId]);

  const moveToReservationPage = () => {
    const params = qs.stringify(
      {
        hotelId,
        roomId,
        ...selectedDate,
      },
      { addQueryPrefix: true },
    );

    navigate(`/reservation${params}`);
  };

  const isEnabled =
    selectedDate.startDate != null && selectedDate.endDate != null;

  const buttonLabel = isEnabled
    ? `${selectedDate.startDate} - ${selectedDate.endDate} (${selectedDate.nights}박)`
    : '예약 날짜를 선택해주세요';

  return (
    <div>
      <RangePicker
        startDate={selectedDate.startDate}
        endDate={selectedDate.endDate}
        onChange={(dateRange) => {
          setSelectedDate({
            startDate: dateRange.from,
            endDate: dateRange.to,
            nights: dateRange.nights,
          });
        }}
      />
      <FixedBottomButton
        label={buttonLabel}
        disabled={isEnabled === false}
        onClick={moveToReservationPage}
      />
    </div>
  );
}

export default SchedulePage;
