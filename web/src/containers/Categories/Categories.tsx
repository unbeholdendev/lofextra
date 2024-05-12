import { useAccountContext } from "@/hooks/contexts";
import { useQuery } from "@/hooks/useQuery";
import { categoriesSchema } from "@/validators/validators";
import { useState } from "react";
import { Category } from "./Category";
import { CategoryFormModal, ModalCategory } from "./CategoryFormModal";
import styles from "./styles.module.css";

export const Categories = () => {
  const { pubKeyHex } = useAccountContext();
  const [modalCategory, setModalCategory] = useState<ModalCategory | null>(
    null
  );

  const { data, refetch } = useQuery(
    `select * from categories where pubKeyHex = '${pubKeyHex}' and deletedAt is null`,
    categoriesSchema,
    { refetchOnRemoteUpdate: true }
  );

  console.log(data);

  return (
    <>
      <div className={styles["action-container"]}>
        <button
          onClick={() =>
            setModalCategory({
              id: null,
              title: "",
            })
          }
        >
          add category
        </button>
      </div>

      <div className={styles.scroll}>
        {data?.length ? (
          data.map((category) => (
            <Category
              key={category.id}
              category={category}
              onDetailClick={(category) => setModalCategory(category)}
            />
          ))
        ) : (
          <div>no categories yet..</div>
        )}
      </div>

      {modalCategory && (
        <CategoryFormModal
          category={modalCategory}
          onSuccess={() => {
            refetch();
          }}
          onClose={() => setModalCategory(null)}
        />
      )}
    </>
  );
};
