import { Draggable } from "@hello-pangea/dnd";
import { type Category as CategoryType } from "../../../validators/types";
import styles from "./styles.module.css";

type Props = {
  category: CategoryType;
  index: number;
  onDetailClick: (category: CategoryType) => void;
  onDelete: () => void;
};

export const Category = ({ category, index, onDetailClick }: Props) => {
  return (
    <Draggable draggableId={category.id} index={index}>
      {(provided) => (
        <div
          onClick={() => onDetailClick(category)}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...{ ...provided.dragHandleProps, role: "row" }}
          className={styles["category-row"]}
        >
          <span className={styles.dnd}>⋮⋮</span>

          <strong>{category.title}</strong>
        </div>
      )}
    </Draggable>
  );
};
