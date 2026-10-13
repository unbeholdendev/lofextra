export const getUnixTimestamp = (date?: Date) =>
  Math.floor(date?.getTime() ?? Date.now());

export const getDateFromTimestamp = (ts?: number) => new Date(ts ?? Date.now());
