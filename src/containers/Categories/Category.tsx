import { Category as CategoryType } from "@/validators/types";
import styles from "./styles.module.css";

type Props = {
  category: CategoryType;
  onDetailClick: (category: CategoryType) => void;
};

export const Category = ({ category, onDetailClick }: Props) => {
  return (
    <div
      className={styles["category-row"]}
      onClick={() => onDetailClick(category)}
    >
      <p>
        <strong>{category.title}</strong>
      </p>
    </div>
  );
};
