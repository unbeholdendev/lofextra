import { useEffect, useState } from "react";

export const useDebounce = <T extends unknown>(input: T, delay = 300) => {
  const [value, setValue] = useState<T>(input);

  useEffect(() => {
    const timeoutId = setTimeout(() => setValue(input), delay);

    return () => clearTimeout(timeoutId);
  }, [input, delay]);

  return value;
};
