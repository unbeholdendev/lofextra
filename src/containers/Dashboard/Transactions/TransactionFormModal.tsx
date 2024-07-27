import { Modal } from "../../../components/Modal";
import { type Transaction } from "../../../validators/types";
import { TransactionDetailHeader } from "./TransactionDetailHeader";
import { TransactionForm } from "./TransactionForm";

type Props = {
  transaction: Transaction;
  onClose: () => void;
};

export const TransactionFormModal = ({ transaction, onClose }: Props) => {
  return (
    <Modal
      onClose={onClose}
      header={
        <TransactionDetailHeader
          transactionId={transaction.id}
          onDeleteSuccess={onClose}
        />
      }
    >
      <TransactionForm
        transaction={transaction}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
};
