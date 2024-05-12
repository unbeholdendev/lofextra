import { useAccountContext } from "@/hooks/contexts";
import { useQuery } from "@/hooks/useQuery";
import { getDateFromTimestamp } from "@/utils/dates";
import { formatNumber } from "@/utils/formatters";
import { Transaction as TransactionType } from "@/validators/types";
import { categoriesSchema } from "@/validators/validators";
import { useMemo } from "react";
import styles from "./styles.module.css";

type Props = {
  transaction: TransactionType;
  onDetailClick: (transaction: TransactionType) => void;
};
export const Transaction = ({ transaction, onDetailClick }: Props) => {
  const { pubKeyHex } = useAccountContext();

  const { data } = useQuery(
    `select * from categories where pubKeyHex = '${pubKeyHex}' and deletedAt is null`,
    categoriesSchema,
    { refetchOnRemoteUpdate: true }
  );

  const category = useMemo(
    () => data?.find((category) => category.id === transaction.categoryId),
    [data, transaction]
  );

  return (
    <div
      className={styles["transaction-row"]}
      onClick={() => onDetailClick(transaction)}
    >
      <div>
        <p className={styles["margin-bottom"]}>
          <strong>{transaction.title}</strong>
        </p>

        {category && (
          <p className={`${styles["margin-bottom"]} ${styles.small}`}>
            {category.title}
          </p>
        )}
      </div>

      <div>
        <p className={styles["margin-bottom"]}>
          <strong>{formatNumber(transaction.amount)}</strong>
        </p>

        <p className={`${styles["margin-bottom"]} ${styles.small}`}>
          {getDateFromTimestamp(transaction.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
