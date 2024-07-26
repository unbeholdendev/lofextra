import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { getRouteApi } from "@tanstack/react-router";
import { QueryKeys } from "../../../queries";
import { transactionsSchema } from "../../../validators/validators";
import { routes } from "../routes";

const { useParams } = getRouteApi(routes.TRANSACTION_DETAIL);

export const TransactionDetail = () => {
  const params = useParams();
  const { pubKeyHex } = useLofikAccount();

  const { data } = useLofikQuery({
    sql: `
      SELECT * FROM transactions 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL
        AND id = '${params.id}'
      `,
    schema: transactionsSchema,
    queryKey: [QueryKeys.GET_TRANSACTION, pubKeyHex],
  });

  const transaction = data?.[0];

  return <pre>{JSON.stringify(transaction, null, 2)}</pre>;
};
