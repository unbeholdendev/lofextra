import { useAccountContext, useQuery } from "@/hooks";
import { getUnixTimestamp } from "@/utils/dates";
import { transactionsSchema } from "@/validators/validators";
import { useState } from "react";
import { Transaction } from "./Transaction";
import { ModalTransaction, TransactionFormModal } from "./TransactionFormModal";
import styles from "./styles.module.css";

export const Transactions = () => {
  const { pubKeyHex } = useAccountContext();
  const [modalTransaction, setModalTransaction] =
    useState<ModalTransaction | null>(null);
  const { data, refetch } = useQuery(
    `select * from transactions where pubKeyHex = '${pubKeyHex}' and deletedAt is null order by createdAt desc`,
    transactionsSchema,
    { refetchOnRemoteUpdate: true }
  );

  console.log(data);

  return (
    <>
      <div className={styles.center}>
        <button
          onClick={() =>
            setModalTransaction({
              id: null,
              title: "",
              amount: null,
              categoryId: "",
              createdAt: getUnixTimestamp(),
            })
          }
        >
          add expense
        </button>
      </div>

      <div className={styles.scroll}>
        {data?.length ? (
          data.map((transaction) => (
            <Transaction
              key={transaction.id}
              transaction={transaction}
              onDetailClick={(transaction) => setModalTransaction(transaction)}
            />
          ))
        ) : (
          <div>nothing yet..</div>
        )}
      </div>

      {modalTransaction && (
        <TransactionFormModal
          transaction={modalTransaction}
          refetchTransactions={refetch}
          onClose={() => setModalTransaction(null)}
        />
      )}
    </>
  );
};
