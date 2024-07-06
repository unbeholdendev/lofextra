import { Category as CategoryType } from "@/validators/types";
import styles from "./styles.module.css";
import { DatabaseMutationOperation, useLofikMutation } from "@lofik/react";
import { useState } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";

type Props = {
  category: CategoryType;
  onDetailClick: (category: CategoryType) => void;
  onDelete: () => void;
};

export const Category = ({ category, onDetailClick, onDelete }: Props) => {
  const [confirm, setOpenConfirm] = useState<boolean>(false);

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {},
  });

  const handleDelete = async () => {
    // Todo: solve why VSCode says its not needed, but in fact its very needed!
    await mutate({
      operation: DatabaseMutationOperation.Delete,
      tableName: "categories",
      identifierValue: category.id as string,
    });

    setOpenConfirm(false);
    onDelete();
  };

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
        />
      )}
    </>
  );
};
