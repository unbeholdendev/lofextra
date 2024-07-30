export const arrayMove = <T extends unknown[]>(
  array: T,
  from: number,
  to: number
) => {
  const newArray = [...array];

  if (from < 0 || from >= newArray.length || to < 0 || to >= newArray.length) {
    return newArray;
  }

  const [item] = newArray.splice(from, 1);

  newArray.splice(to, 0, item);

  return newArray;
};
