import { useAccountContext } from "@/hooks/contexts";
import { useQuery } from "@/hooks/useQuery";
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

  const { data: totalData, refetch: refetchTotal } = useQuery(
    `select sum(amount) as total from transactions where pubKeyHex = '${pubKeyHex}' and deletedAt is null and createdAt > ${DAYS_AGO_30_TS}`,
    z.array(z.object({ total: z.number().nullable() })),
    { refetchOnRemoteUpdate: true }
  );

  const { data: transactions, refetch: refetchTransactions } = useQuery(
    `select * from transactions where pubKeyHex = '${pubKeyHex}' and deletedAt is null order by createdAt desc`,
    transactionsSchema,
    { refetchOnRemoteUpdate: true }
  );

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
          onSuccess={() => {
            refetchTotal();
            refetchTransactions();
          }}
          onClose={() => setModalTransaction(null)}
        />
      )}
    </>
  );
};
