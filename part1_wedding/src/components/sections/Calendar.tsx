import React from 'react';
import classNames from 'classnames/bind';
import Section from '@shared/Section';
import styles from './Calendar.module.scss';
import { parseISO, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

const cx = classNames.bind(styles);

const css = `
  .rdp-nav {
    display: none;  
  }

  .rdp-month_caption {
    display: none;
  }

  .rdp-weekday {
    font-weight: bold;
    font-size: 14px;
  }

  .rdp-selected {
    .rdp-day_button {
      background-color: var(--red);
      font-weight: bold;
      color: #fff;
      border: none;
    }
  }

  .rdp-day_button {
    cursor: default;
  }
`;

function Calendar({ date }: { date: string }) {
  const weddingDate = parseISO(date);

  return (
    <Section
      title={
        <div className={cx('wrap-header')}>
          <span className={cx('txt-date')}>
            {format(weddingDate, 'yyyy.MM.dd')}
          </span>
          <span className={cx('txt-time')}>
            {format(weddingDate, 'aaa h시 eeee', { locale: ko })}
          </span>
        </div>
      }
    >
      <div className={cx('wrap-calender')}>
        <style>{css}</style>
        <DayPicker
          locale={ko}
          month={weddingDate}
          selected={weddingDate}
          mode="single"
          onSelect={() => {}}
        />
      </div>
    </Section>
  );
}

export default Calendar;
