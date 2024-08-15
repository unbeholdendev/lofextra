import { useRouter } from "@tanstack/react-router";
import { RecurringTransactionRepeatInterval } from "../../../validators/types";
import { useConfigContext } from "../Config/ConfigContext";
import { routes } from "../routes";
import { RecurringTransactionForm } from "./RecurringTransactionForm";

export const RecurringTransactionCreate = () => {
  const router = useRouter();
  const { baseCurrency } = useConfigContext();

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
          currency: baseCurrency,
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
