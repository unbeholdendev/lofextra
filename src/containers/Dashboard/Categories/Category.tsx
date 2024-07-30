import { Draggable } from "@hello-pangea/dnd";
import { DatabaseMutationOperation, useLofikMutation } from "@lofik/react";
import { useState } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { type Category as CategoryType } from "../../../validators/types";
import styles from "./styles.module.css";

type Props = {
  category: CategoryType;
  index: number;
  onDetailClick: (category: CategoryType) => void;
  onDelete: () => void;
};

export const Category = ({
  category,
  index,
  onDetailClick,
  onDelete,
}: Props) => {
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
      <Draggable draggableId={category.id} index={index}>
        {(provided) => (
          <div
            onClick={() => onDetailClick(category)}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...{ ...provided.dragHandleProps, role: "row" }}
            className={styles["category-row"]}
          >
            <div>
              <span className={styles.dnd}>⋮⋮</span>

              <strong>{category.title}</strong>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation(); // Prevent whole row-click event
                setOpenConfirm(true);
              }}
            >
              🗑️
            </div>
          </div>
        )}
      </Draggable>

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
