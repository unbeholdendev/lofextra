import { useQuery } from "@/hooks";
import { getDateFromTimestamp } from "@/utils/dates";
import { Transaction as TransactionType } from "@/validators/types";
import { categoriesSchema } from "@/validators/validators";
import { useMemo } from "react";
import styles from "./styles.module.css";

type Props = {
  transaction: TransactionType;
  onDetailClick: (transaction: TransactionType) => void;
};
export const Transaction = ({ transaction, onDetailClick }: Props) => {
  const { data } = useQuery("select * from categories", categoriesSchema);

  const category = useMemo(
    () => data?.find((category) => category.id === transaction.categoryId),
    [data, transaction]
  );

  return (
    <div className={styles["transaction-row"]}>
      <span className={styles.flex}>
        {getDateFromTimestamp(transaction.createdAt).toLocaleString()}
      </span>

      <span className={styles.flex}>
        {`${transaction.title} ${category ? `(${category.title})` : ""}`}
      </span>

      <span className={styles.flex}>{transaction.amount}</span>

      <button className="outline" onClick={() => onDetailClick(transaction)}>
        detail
      </button>
    </div>
  );
};
