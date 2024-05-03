import { useCallback, useEffect, useMemo } from "react";
import { TypeOf, ZodSchema, optional } from "zod";
import { useDatabaseContext, useQueryCacheContext } from "./contexts";

type UseQueryReturnType<T extends ZodSchema> = {
  data: TypeOf<T> | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

type QueryOptions = {
  refetchOnRemoteUpdate?: boolean;
};

export const useQuery = <T extends ZodSchema>(
  query: string,
  schema: T,
  options?: QueryOptions
): UseQueryReturnType<T> => {
  const { exec } = useDatabaseContext();
  const { cache, setCache, cacheRefetchDate } = useQueryCacheContext();

  const { data, isLoading } = useMemo(
    () =>
      cache[query] ?? {
        data: undefined,
        isLoading: true,
      },
    [cache, query]
  );

  const fetch = useCallback(async () => {
    setCache((prev) => ({
      ...prev,
      [query]: { ...prev[query], isLoading: true },
    }));

    const res = await exec(query);

    setCache((prev) => ({
      ...prev,
      [query]: { data: res, isLoading: false },
    }));
  }, [exec, query, setCache]);

  useEffect(() => {
    if (!cache[query] || options?.refetchOnRemoteUpdate) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch, cacheRefetchDate, options?.refetchOnRemoteUpdate, query]);

  const validatedData = useMemo(
    () => optional(schema).parse(data),
    [data, schema]
  );

  return useMemo(
    () => ({
      data: validatedData,
      isLoading,
      refetch: fetch,
    }),
    [validatedData, fetch, isLoading]
  );
};
