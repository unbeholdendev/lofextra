import { QueryKeys } from "@/queries";
import { useLofikQueryClient } from "@lofik/react";
import { useCallback, useMemo } from "react";

export const useRefetchQueries = () => {
  const queryClient = useLofikQueryClient();

  const refetch = useCallback(() => {
    for (const queryKey of Object.keys(QueryKeys)) {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
  }, [queryClient]);

  return useMemo(() => refetch, [refetch]);
};
