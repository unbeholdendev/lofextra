import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { recurringTransactionsSchema } from "../../../validators/validators";
import { QueryKeys } from "../constants";
import { routes } from "../routes";
import { RecurringTransactionDelete } from "./RecurringTransactionDelete";
import { RecurringTransactionForm } from "./RecurringTransactionForm";
import styles from "./styles.module.css";

const { useParams } = getRouteApi(routes.RECURRING_TRANSACTIONS_DETAIL);

export const RecurringTransactionDetail = () => {
  const params = useParams();
  const { pubKeyHex } = useLofikAccount();
  const router = useRouter();

  const { data } = useLofikQuery({
    sql: `
      SELECT * FROM recurringTransactions 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL
        AND id = '${params.id}'
      `,
    schema: recurringTransactionsSchema,
    queryKey: [QueryKeys.GET_RECURRING_TRANSACTION, pubKeyHex, params.id],
    enabled: !!params.id,
  });

  const recurringTransaction = data?.[0];

  const navigateToRecurringTransactions = () =>
    router.navigate({ to: routes.RECURRING_TRANSACTIONS });
  const goBack = () => router.history.back();

  return (
    <>
      <div className={styles["detail-header"]}>
        <h3 className={styles["no-margin-bottom"]}>
          update or delete recurring transaction
        </h3>

        <RecurringTransactionDelete
          recurringTransactionId={recurringTransaction?.id as string}
          onSuccess={navigateToRecurringTransactions}
        />
      </div>

      {recurringTransaction ? (
        <RecurringTransactionForm
          recurringTransaction={recurringTransaction}
          onSuccess={navigateToRecurringTransactions}
          onCancel={goBack}
        />
      ) : (
        <div>recurring transaction not found</div>
      )}
    </>
  );
};
