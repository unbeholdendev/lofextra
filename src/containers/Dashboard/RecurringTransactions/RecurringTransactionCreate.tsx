import { useRouter } from "@tanstack/react-router";
import { RecurringTransactionRepeatInterval } from "../../../validators/types";
import { routes } from "../routes";
import { RecurringTransactionForm } from "./RecurringTransactionForm";

export const RecurringTransactionCreate = () => {
  const router = useRouter();

  const navigateToRecurringTransactions = () =>
    router.navigate({ to: routes.RECURRING_TRANSACTIONS });
  const goBack = () => router.history.back();

  return (
    <>
      <h3>create recurring transaction</h3>

      <RecurringTransactionForm
        recurringTransaction={{
          id: null,
          title: "",
          amount: null,
          categoryId: "",
          repeatDay: 1,
          repeatInterval: RecurringTransactionRepeatInterval.MONTH,
          createdAt: null,
        }}
        onSuccess={navigateToRecurringTransactions}
        onCancel={goBack}
      />
    </>
  );
};
