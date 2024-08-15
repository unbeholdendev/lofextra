import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { useState } from "react";
import { Modal } from "../../../components/Modal";
import { useFormatCurrency } from "../../../hooks/useFormatCurrency";
import { getDateFromTimestamp } from "../../../utils/dates";
import type { Transaction } from "../../../validators/types";
import { transactionsSchema } from "../../../validators/validators";
import { QueryKeys } from "../constants";
import { TransactionFormModal } from "../Transactions/TransactionFormModal";
import styles from "./styles.module.css";

type Props = {
  categoryTitle: string;
  categoryId: string;
  categoryTotal: number;
  intervalCondition: string;
  search: string;
  onClose: () => void;
};

export const StatisticsDetailModal = ({
  categoryTitle,
  categoryId,
  categoryTotal,
  intervalCondition,
  search,
  onClose,
}: Props) => {
  const { pubKeyHex } = useLofikAccount();
  const { formatCurrency } = useFormatCurrency();
  const [modalTransaction, setModalTransaction] = useState<Transaction | null>(
    null
  );

  const categoryCondition =
    categoryId === "-1" ? "c.id IS NULL" : `t.categoryId = '${categoryId}'`;

  const { data } = useLofikQuery({
    sql: `
      SELECT
        t.*
      FROM transactions t 
      LEFT JOIN 
        categories c ON c.id = t.categoryId AND c.deletedAt IS NULL 
      WHERE 
        t.pubKeyHex = '${pubKeyHex}' 
        AND ${categoryCondition} 
        AND t.deletedAt IS NULL
        AND ${intervalCondition} 
        ${search ? `AND LOWER(t.title) LIKE '%${search.toLowerCase()}%'` : ""}
      ORDER BY t.createdAt DESC
    `,
    schema: transactionsSchema,
    queryKey: [
      QueryKeys.GET_STATISTICS_TRANSACTIONS_IN_CATEGORY,
      pubKeyHex,
      categoryCondition,
      intervalCondition,
      search,
    ],
  });

  return (
    <>
      <Modal
        onClose={onClose}
        showCloseIcon
        header={
          <div>
            <strong className={styles.large}>{categoryTitle}</strong>{" "}
            <span className={styles.large}>
              ({formatCurrency(categoryTotal)})
            </span>
          </div>
        }
      >
        {data?.length ? (
          data.map((transaction) => (
            <div
              key={transaction.id}
              className={styles["transaction-row"]}
              onClick={() => setModalTransaction(transaction)}
            >
              <p className={styles["margin-bottom"]}>
                <strong>{transaction.title}</strong>
              </p>

              <div className={styles["transaction-column"]}>
                <p
                  className={`${styles["margin-bottom"]} ${styles["flex-vertical-center"]}`}
                >
                  {transaction.amount !== transaction.baseAmount && (
                    <span
                      className={`${styles["margin-right-small"]} ${styles.small}`}
                    >
                      {formatCurrency(transaction.baseAmount)}
                    </span>
                  )}
                  <strong>
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </strong>{" "}
                  <span className={styles.small}>
                    (
                    {(transaction.baseAmount / categoryTotal).toLocaleString(
                      undefined,
                      {
                        style: "percent",
                        minimumFractionDigits: 2,
                      }
                    )}
                    )
                  </span>
                </p>

                <p className={`${styles["margin-bottom"]} ${styles.small}`}>
                  {getDateFromTimestamp(
                    transaction.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div>nothing yet..</div>
        )}
      </Modal>

      {modalTransaction && (
        <TransactionFormModal
          transaction={modalTransaction}
          onClose={() => setModalTransaction(null)}
        />
      )}
    </>
  );
};
