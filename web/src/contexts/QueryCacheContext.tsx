import { ReactNode, createContext, useState } from "react";

type CacheItem = {
  data: unknown[];
  isLoading: boolean;
};

type QueryCache = Record<string, CacheItem>;

type QueryCacheContext = {
  cache: QueryCache;
  setCache: React.Dispatch<React.SetStateAction<QueryCache>>;
  cacheRefetchDate: Date;
  setCacheRefetchDate: React.Dispatch<React.SetStateAction<Date>>;
};

export const QueryCacheContext = createContext({} as QueryCacheContext);

type Props = {
  children: ReactNode;
};

export const QueryCacheProvider = ({ children }: Props) => {
  const [cache, setCache] = useState<QueryCache>({});
  const [cacheRefetchDate, setCacheRefetchDate] = useState(new Date());

  return (
    <QueryCacheContext.Provider
      value={{ cache, setCache, cacheRefetchDate, setCacheRefetchDate }}
    >
      {children}
    </QueryCacheContext.Provider>
  );
};
