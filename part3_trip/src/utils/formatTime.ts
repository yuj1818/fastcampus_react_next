function formatTime(ms: number) {
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const days = Math.floor(ms / day);

  if (days < 0) {
    return '';
  }

  const restHour = Math.floor((ms - days * day) / hour);
  const restMin = Math.floor((ms - days * day - restHour * hour) / minute);
  const restSec = Math.floor(
    (ms - days * day - restHour * hour - restMin * minute) / 1000,
  );

  const HH = `${restHour}`.padStart(2, '0');
  const mm = `${restMin}`.padStart(2, '0');
  const SS = `${restSec}`.padStart(2, '0');

  return days > 0 ? `${days}일 ${HH}:${mm}:${SS}` : `${HH}:${mm}:${SS}`;
}

export default formatTime;
