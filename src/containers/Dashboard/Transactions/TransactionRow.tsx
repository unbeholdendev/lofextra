import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { useMemo } from "react";
import { useFormatCurrency } from "../../../hooks/useFormatCurrency";
import { getDateFromTimestamp } from "../../../utils/dates";
import { type Transaction as TransactionType } from "../../../validators/types";
import { categoriesSchema } from "../../../validators/validators";
import { QueryKeys } from "../constants";
import styles from "./styles.module.css";

type Props = {
  transaction: TransactionType;
  onDetailClick: (transaction: TransactionType) => void;
};
export const TransactionRow = ({ transaction, onDetailClick }: Props) => {
  const { pubKeyHex } = useLofikAccount();
  const { formatCurrency } = useFormatCurrency();

  const { data } = useLofikQuery({
    sql: `
      SELECT * FROM categories 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL
      `,
    schema: categoriesSchema,
    queryKey: [QueryKeys.GET_CATEGORIES, pubKeyHex],
  });

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

      <div className={styles["transaction-row-right"]}>
        <p
          className={`${styles["margin-bottom"]} ${styles["flex-vertical-center"]}`}
        >
          {transaction.amount !== transaction.baseAmount && (
            <span className={`${styles["margin-right-small"]} ${styles.small}`}>
              {formatCurrency(transaction.baseAmount)}
            </span>
          )}

          <strong>
            {formatCurrency(transaction.amount, transaction.currency)}
          </strong>
        </p>

        <p className={`${styles["margin-bottom"]} ${styles.small}`}>
          {getDateFromTimestamp(transaction.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
