import { DatabaseMutationOperation, useLofikMutation } from "@lofik/react";
import { useState } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { refetchQueries } from "../../../utils/refetchQueries";
import { TableNames } from "../constants";
import styles from "./styles.module.css";

type Props = {
  recurringTransactionId: string;
  onSuccess?: () => void;
};

export const RecurringTransactionDelete = ({
  recurringTransactionId,
  onSuccess,
}: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteRelated, setConfirmDeleteRelated] = useState(false);

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {
      refetchQueries();

      onSuccess?.();
    },
  });

  const handleDelete = (shouldDeleteRelated: boolean) => {
    mutate({
      operation: DatabaseMutationOperation.Delete,
      tableName: TableNames.RECURRING_TRANSACTIONS,
      identifierValue: recurringTransactionId,
    });

    if (shouldDeleteRelated) {
      mutate({
        operation: DatabaseMutationOperation.Delete,
        tableName: TableNames.TRANSACTIONS,
        identifierColumn: "recurringTransactionId",
        identifierValue: recurringTransactionId,
      });
    }
  };

  return (
    <>
      <span className={styles.delete} onClick={() => setConfirmDelete(true)}>
        🗑️
      </span>

      {confirmDelete && (
        <ConfirmModal
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => setConfirmDeleteRelated(true)}
          header="Are you sure to delete the recurring transaction?"
        />
      )}

      {confirmDeleteRelated && (
        <ConfirmModal
          onCancel={() => handleDelete(false)}
          onConfirm={() => handleDelete(true)}
          header="Do you also want to delete all related transactions?"
        />
      )}
    </>
  );
};
