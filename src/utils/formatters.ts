export const formatNumber = (num: number) => {
  const formatter = new Intl.NumberFormat(navigator.language);

  return formatter.format(num);
};
