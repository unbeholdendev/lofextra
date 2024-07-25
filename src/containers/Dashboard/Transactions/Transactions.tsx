import { type Dispatch, type SetStateAction } from "react";
import { type Transaction as TransactionType } from "../../../validators/types";
import { Transaction } from "./Transaction";
import { type ModalTransaction } from "./TransactionFormModal";
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
