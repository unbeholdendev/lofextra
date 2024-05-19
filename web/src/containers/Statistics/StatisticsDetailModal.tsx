import { Modal } from "@/components/Modal";
import { useAccountContext } from "@/hooks/contexts";
import { useQuery } from "@/hooks/useQuery";
import { getDateFromTimestamp } from "@/utils/dates";
import { formatNumber } from "@/utils/formatters";
import { transactionsSchema } from "@/validators/validators";
import { useState } from "react";
import {
  ModalTransaction,
  TransactionFormModal,
} from "../Transactions/TransactionFormModal";
import styles from "./styles.module.css";

type Props = {
  categoryTitle: string;
  categoryId: string;
  categoryTotal: number;
  intervalCondition: string;
  onClose: () => void;
};

export const StatisticsDetailModal = ({
  categoryTitle,
  categoryId,
  categoryTotal,
  intervalCondition,
  onClose,
}: Props) => {
  const { pubKeyHex } = useAccountContext();
  const [modalTransaction, setModalTransaction] =
    useState<ModalTransaction | null>(null);

  const categoryCondition =
    categoryId === "-1" ? "categoryId is null" : `categoryId = '${categoryId}'`;

  const { data } = useQuery(
    `select * from transactions t where pubKeyHex = '${pubKeyHex}' and ${categoryCondition} and deletedAt is null and ${intervalCondition} order by createdAt desc`,
    transactionsSchema,
    { refetchOnRemoteUpdate: true }
  );

  return (
    <>
      <Modal
        onClose={onClose}
        header={
          <div>
            <strong className={styles.large}>{categoryTitle}</strong>{" "}
            <span className={styles.large}>
              ({formatNumber(categoryTotal)})
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
                <p className={styles["margin-bottom"]}>
                  <strong>{formatNumber(transaction.amount)}</strong>{" "}
                  <span className={styles.small}>
                    (
                    {(transaction.amount / categoryTotal).toLocaleString(
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
