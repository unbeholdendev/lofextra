import { useRouter } from "@tanstack/react-router";
import { getUnixTimestamp } from "../../../utils/dates";
import { useConfigContext } from "../Config/ConfigContext";
import { routes } from "../routes";
import { TransactionForm } from "./TransactionForm";

export const TransactionCreate = () => {
  const router = useRouter();
  const { baseCurrency } = useConfigContext();

  const navigateToDashboard = () => router.navigate({ to: routes.DASHBOARD });
  const goBack = () => router.history.back();

  return (
    <>
      <h3>create transaction</h3>

      <TransactionForm
        transaction={{
          id: null,
          title: "",
          amount: null,
          baseAmount: null,
          categoryId: "",
          currency: baseCurrency,
          recurringTransactionId: null,
          recurringTransactionIndex: null,
          createdAt: getUnixTimestamp(),
        }}
        onSuccess={navigateToDashboard}
        onCancel={goBack}
      />
    </>
  );
};
