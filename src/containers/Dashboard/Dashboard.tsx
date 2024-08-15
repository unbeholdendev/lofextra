import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { getTimestampAfterSubtractingDays } from "../../utils/dates";
import { transactionsSchema } from "../../validators/validators";
import { Overview } from "./Transactions/Overview";
import { Transactions } from "./Transactions/Transactions";
import { QueryKeys } from "./constants";
import { routes } from "./routes";

const DAYS_AGO_30_TS = getTimestampAfterSubtractingDays(30);

export const Dashboard = () => {
  const { pubKeyHex } = useLofikAccount();
  const navigate = useNavigate();

  const { data: totalData } = useLofikQuery({
    sql: `
      SELECT 
        SUM(baseAmount) AS total 
      FROM transactions 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL 
        AND createdAt > ${DAYS_AGO_30_TS}
    `,
    schema: z.array(z.object({ total: z.number().nullable() })),
    queryKey: [QueryKeys.GET_TRANSACTIONS_TOTAL, pubKeyHex],
  });

  const { data: transactions } = useLofikQuery({
    sql: `
      SELECT * FROM transactions 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL 
        AND createdAt > ${DAYS_AGO_30_TS} 
      ORDER BY createdAt desc`,
    schema: transactionsSchema,
    queryKey: [QueryKeys.GET_TRANSACTIONS, pubKeyHex],
  });

  const total = useMemo(() => totalData?.[0].total ?? NaN, [totalData]);

  return (
    <>
      <Overview total={total} />

      <Transactions
        transactions={transactions}
        onDetailClick={(transaction) =>
          navigate({
            to: routes.TRANSACTION_DETAIL,
            params: { id: transaction.id },
          })
        }
      />
    </>
  );
};
