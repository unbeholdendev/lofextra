import { useAccountContext } from "@/hooks/contexts";
import { useLofiQuery } from "@/hooks/useLofiQuery";
import { QueryKeys } from "@/queries";
import { getTimestampAfterSubtractingDays } from "@/utils/dates";
import { transactionsSchema } from "@/validators/validators";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Overview } from "./Transactions/Overview";
import {
  ModalTransaction,
  TransactionFormModal,
} from "./Transactions/TransactionFormModal";
import { Transactions } from "./Transactions/Transactions";

const DAYS_AGO_30_TS = getTimestampAfterSubtractingDays(30);

export const Dashboard = () => {
  const { pubKeyHex } = useAccountContext();
  const [modalTransaction, setModalTransaction] =
    useState<ModalTransaction | null>(null);

  const { data: totalData } = useLofiQuery({
    sql: `select sum(amount) as total from transactions where pubKeyHex = '${pubKeyHex}' and deletedAt is null and createdAt > ${DAYS_AGO_30_TS}`,
    schema: z.array(z.object({ total: z.number().nullable() })),
    queryKey: [QueryKeys.GET_TRANSACTIONS_TOTAL, pubKeyHex],
  });

  const { data: transactions } = useLofiQuery({
    sql: `select * from transactions where pubKeyHex = '${pubKeyHex}' and deletedAt is null and createdAt > ${DAYS_AGO_30_TS} order by createdAt desc`,
    schema: transactionsSchema,
    queryKey: [QueryKeys.GET_TRANSACTIONS, pubKeyHex],
  });

  const total = useMemo(() => totalData?.[0].total ?? NaN, [totalData]);

  return (
    <>
      <Overview total={total} setModalTransaction={setModalTransaction} />

      <Transactions
        transactions={transactions}
        setModalTransaction={setModalTransaction}
      />

      {modalTransaction && (
        <TransactionFormModal
          transaction={modalTransaction}
          onClose={() => setModalTransaction(null)}
        />
      )}
    </>
  );
};
