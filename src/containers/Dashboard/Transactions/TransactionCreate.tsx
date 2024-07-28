import { useRouter } from "@tanstack/react-router";
import { getUnixTimestamp } from "../../../utils/dates";
import { routes } from "../routes";
import { TransactionForm } from "./TransactionForm";

const newTransaction = {
  id: null,
  title: "",
  amount: null,
  categoryId: "",
  createdAt: getUnixTimestamp(),
};

export const TransactionCreate = () => {
  const router = useRouter();

  const navigateToDashboard = () => router.navigate({ to: routes.DASHBOARD });
  const goBack = () => router.history.back();

  return (
    <>
      <h3>create transaction</h3>

      <TransactionForm
        transaction={newTransaction}
        onSuccess={navigateToDashboard}
        onCancel={goBack}
      />
    </>
  );
};
