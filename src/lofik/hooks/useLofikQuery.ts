import {
  type QueryKey,
  type UndefinedInitialDataOptions,
  useQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import type { z } from "zod";
import { sqlocal } from "../db/sqlocal";

type Params<T extends z.ZodType> = Omit<
  UndefinedInitialDataOptions<unknown, Error, unknown, QueryKey>,
  "queryFn"
> & { sql: string; schema: T };

export const useLofikQuery = <T extends z.ZodType>({
  sql,
  schema,
  ...options
}: Params<T>) => {
  const query = useQuery({ ...options, queryFn: () => sqlocal.sql(sql) });

  const validatedData = useMemo(
    () => schema.optional().parse(query.data),
    [query.data, schema]
  );

  return {
    ...query,
    data: validatedData,
  };
};
