import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { useMemo } from "react";
import { QueryKeys } from "../../../queries";
import { formatNumber } from "../../../utils/formatters";
import { type RecurringTransaction } from "../../../validators/types";
import { categoriesSchema } from "../../../validators/validators";
import styles from "./styles.module.css";

type Props = {
  recurringTransaction: RecurringTransaction;
  onDetailClick: (recurringTransaction: RecurringTransaction) => void;
};

export const RecurringTransactionRow = ({
  recurringTransaction,
  onDetailClick,
}: Props) => {
  const { pubKeyHex } = useLofikAccount();

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
    () =>
      data?.find((category) => category.id === recurringTransaction.categoryId),
    [data, recurringTransaction]
  );

  return (
    <div
      className={styles["transaction-row"]}
      onClick={() => onDetailClick(recurringTransaction)}
    >
      <div>
        <p className={styles["margin-bottom"]}>
          <strong>{recurringTransaction.title}</strong>
        </p>

        {category && (
          <p className={`${styles["margin-bottom"]} ${styles.small}`}>
            {category.title}
          </p>
        )}
      </div>

      <div className={styles["transaction-row-right"]}>
        <p className={styles["margin-bottom"]}>
          <strong>{formatNumber(recurringTransaction.amount)}</strong>
        </p>

        <p className={`${styles["margin-bottom"]} ${styles.small}`}>
          on day {recurringTransaction.repeatDay} of every month
        </p>
      </div>
    </div>
  );
};
