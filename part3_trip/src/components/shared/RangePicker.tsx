import { ko } from 'date-fns/locale';
import { parseISO, isSameDay, format, differenceInDays } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import styled from '@emotion/styled';
import { colors } from '@styles/colorPalette';
import { useEffect, useState } from 'react';

interface RangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (dateRange: { from?: string; to?: string; nights: number }) => void;
}

function RangePicker({ startDate, endDate, onChange }: RangePickerProps) {
  const today = new Date();
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (startDate || endDate) {
      setRange({
        from: startDate ? parseISO(startDate) : undefined,
        to: endDate ? parseISO(endDate) : undefined,
      });
    }
  }, [startDate, endDate]);

  const handleDayClick = (newRange: DateRange | undefined) => {
    setRange(newRange);

    if (newRange == null) return;
    const { from, to } = newRange;

    if (from && to && isSameDay(from, to)) {
      return;
    }

    onChange({
      from: from ? format(from, 'yyyy-MM-dd') : undefined,
      to: to ? format(to, 'yyyy-MM-dd') : undefined,
      nights: from && to ? differenceInDays(to, from) : 0,
    });
  };

  return (
    <Container>
      <DayPicker
        locale={ko}
        mode="range"
        numberOfMonths={5}
        defaultMonth={today}
        onSelect={handleDayClick}
        selected={range}
      />
    </Container>
  );
}

const Container = styled.div`
  padding-bottom: 80px;

  .rdp-month {
    position: relative;
    width: 100%;
    text-align: center;
    padding: 60px 0 30px;
  }

  .rdp-month_caption {
    position: absolute;
    top: 25px;
    left: 20px;
    color: ${colors.black};
    font-weight: bold;
  }

  .rdp-nav {
    display: none;
  }

  .rdp-month_grid {
    width: 100%;
  }

  .rdp-weekdays .rdp-weekday {
    height: 45px;
    font-size: 12px;
    color: ${colors.gray400};
    font-weight: bold;
  }

  .rdp-weeks .rdp-week {
    height: 45px;
  }

  .rdp-day .rdp-day_button {
    position: relative;
    width: 100%;
    line-height: 45px;
  }

  .rdp-selected {
    background-color: ${colors.blue100};
  }

  .rdp-range_start,
  .rdp-range_end {
    position: relative;
    color: ${colors.white};
  }

  .rdp-range_start::after,
  .rdp-range_end::after {
    z-index: -1;
    display: block;
    width: calc(100% - 1px);
    height: 45px;
    position: absolute;
    top: 50%;
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: ${colors.blue};
    content: '';
  }
`;

export default RangePicker;
