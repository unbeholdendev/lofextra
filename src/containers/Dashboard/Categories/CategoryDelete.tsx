import { DatabaseMutationOperation, useLofikMutation } from "@lofik/react";
import { useState } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useRefetchQueries } from "../../../hooks/useRefetchQueries";
import styles from "./styles.module.css";

type Props = {
  categoryId: string;
  onSuccess?: () => void;
};

export const CategoryDelete = ({ categoryId, onSuccess }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const refetchQueries = useRefetchQueries();

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
      tableName: "categories",
      identifierValue: categoryId,
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
          header="Are you sure to delete the category?"
        />
      )}
    </>
  );
};
