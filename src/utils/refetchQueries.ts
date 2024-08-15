import { queryClient } from "@lofik/react";
import { QueryKeys } from "../containers/Dashboard/constants";

export const refetchQueries = () => {
  for (const queryKey of Object.keys(QueryKeys)) {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }
};
