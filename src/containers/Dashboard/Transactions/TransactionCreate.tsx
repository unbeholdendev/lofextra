import { useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();

  const navigateToDashboard = () => navigate({ to: routes.DASHBOARD });

  return (
    <>
      <h3>create transaction</h3>

      <TransactionForm
        transaction={newTransaction}
        onSuccess={navigateToDashboard}
        onCancel={navigateToDashboard}
      />
    </>
  );
};
