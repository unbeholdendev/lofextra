import { DatabaseMutationOperation, useLofikMutation } from "@lofik/react";
import { useState } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { refetchQueries } from "../../../utils/refetchQueries";
import { TableNames } from "../constants";
import styles from "./styles.module.css";

type Props = {
  transactionId: string;
  onSuccess?: () => void;
};

export const TransactionDelete = ({ transactionId, onSuccess }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {
      refetchQueries();

      onSuccess?.();
    },
  });

  const handleDelete = () =>
    mutate({
      operation: DatabaseMutationOperation.Delete,
      tableName: TableNames.TRANSACTIONS,
      identifierValue: transactionId,
    });

  return (
    <>
      <span className={styles.delete} onClick={() => setConfirmDelete(true)}>
        🗑️
      </span>

      {confirmDelete && (
        <ConfirmModal
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          header="Are you sure to delete the transaction?"
        />
      )}
    </>
  );
};
