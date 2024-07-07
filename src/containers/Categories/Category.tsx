import { Category as CategoryType } from "@/validators/types";
import { DatabaseMutationOperation, useLofikMutation } from "@lofik/react";
import { useState } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import styles from "./styles.module.css";

type Props = {
  category: CategoryType;
  onDetailClick: (category: CategoryType) => void;
  onDelete: () => void;
};

export const Category = ({ category, onDetailClick, onDelete }: Props) => {
  const [confirm, setOpenConfirm] = useState(false);

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {
      setOpenConfirm(false);
      onDelete();
    },
  });

  const handleDelete = () =>
    mutate({
      operation: DatabaseMutationOperation.Delete,
      tableName: "categories",
      identifierValue: category.id as string,
    });

  return (
    <>
      <div
        className={styles["category-row"]}
        onClick={() => onDetailClick(category)}
      >
        <strong>{category.title}</strong>
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent whole row-click event
            setOpenConfirm(true);
          }}
        >
          🗑️
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          onCancel={() => setOpenConfirm(false)}
          onConfirm={handleDelete}
          header="Are you sure to delete the category?"
        />
      )}
    </>
  );
};
