export const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const appendSecondsAndMilis = (
  originalTs: number,
  dateString: string
) => {
  const originalDate = new Date(originalTs);

  const seconds = String(originalDate.getSeconds()).padStart(2, "0");
  const milliseconds = String(originalDate.getMilliseconds()).padStart(3, "0");

  return `${dateString}:${seconds}.${milliseconds}`;
};

export const getUnixTimestamp = (date?: Date) =>
  Math.floor(date?.getTime() ?? Date.now());

export const getDateFromTimestamp = (ts?: number) => new Date(ts ?? Date.now());

export const getTimestampAfterSubtractingDays = (days: number) => {
  const now = new Date();

  now.setDate(now.getDate() - days);

  return now.getTime();
};

export const getEndOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

export const getStartOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const getEndOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
