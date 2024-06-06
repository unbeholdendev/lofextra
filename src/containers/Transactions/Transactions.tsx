import { Transaction as TransactionType } from "@/validators/types";
import { Dispatch, SetStateAction } from "react";
import { Transaction } from "./Transaction";
import { ModalTransaction } from "./TransactionFormModal";
import styles from "./styles.module.css";

type Props = {
  transactions: TransactionType[] | undefined;
  setModalTransaction: Dispatch<SetStateAction<ModalTransaction | null>>;
};

export const Transactions = ({ transactions, setModalTransaction }: Props) => {
  return (
    <div className={styles.scroll}>
      {transactions?.length ? (
        transactions.map((transaction) => (
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
  );
};
