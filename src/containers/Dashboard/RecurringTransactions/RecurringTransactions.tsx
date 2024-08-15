import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { useNavigate } from "@tanstack/react-router";
import { recurringTransactionsSchema } from "../../../validators/validators";
import { QueryKeys } from "../constants";
import { routes } from "../routes";
import { RecurringTransactionRow } from "./RecurringTransactionRow";
import styles from "./styles.module.css";

export const RecurringTransactions = () => {
  const { pubKeyHex } = useLofikAccount();
  const navigate = useNavigate();

  const { data: recurringTransactions } = useLofikQuery({
    sql: `
        SELECT * FROM recurringTransactions 
        WHERE 
          pubKeyHex = '${pubKeyHex}' 
          AND deletedAt IS NULL
        ORDER BY createdAt`,
    schema: recurringTransactionsSchema,
    queryKey: [QueryKeys.GET_RECURRING_TRANSACTIONS, pubKeyHex],
  });

  return (
    <>
      <div className={styles.overview}>
        <div>
          <div>recurring transactions total</div>
          <div className={styles.large}>
            <strong>{recurringTransactions?.length ?? 0}</strong>
          </div>
        </div>

        <button
          onClick={() =>
            navigate({
              to: routes.RECURRING_TRANSACTIONS_CREATE,
            })
          }
        >
          create recurring transaction
        </button>
      </div>

      <div className={styles.scroll}>
        {!!recurringTransactions?.length ? (
          recurringTransactions.map((recurringTransaction) => (
            <RecurringTransactionRow
              key={recurringTransaction.id}
              recurringTransaction={recurringTransaction}
              onDetailClick={(recurringTransaction) =>
                navigate({
                  to: routes.RECURRING_TRANSACTIONS_DETAIL,
                  params: { id: recurringTransaction.id },
                })
              }
            />
          ))
        ) : (
          <div>no recurring transactions yet..</div>
        )}
      </div>
    </>
  );
};
