import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { categoriesSchema } from "../../../validators/validators";
import { QueryKeys } from "../constants";
import { routes } from "../routes";
import { CategoryDelete } from "./CategoryDelete";
import { CategoryForm } from "./CategoryForm";
import styles from "./styles.module.css";

const { useParams } = getRouteApi(routes.CATEGORY_DETAIL);

export const CategoryDetail = () => {
  const params = useParams();
  const { pubKeyHex } = useLofikAccount();
  const router = useRouter();

  const { data } = useLofikQuery({
    sql: `
      SELECT * FROM categories 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL
        AND id = '${params.id}'
      `,
    schema: categoriesSchema,
    queryKey: [QueryKeys.GET_CATEGORY, pubKeyHex, params.id],
    enabled: !!params.id,
  });

  const category = data?.[0];

  const navigateToCategories = () => router.navigate({ to: routes.CATEGORIES });
  const goBack = () => router.history.back();

  return (
    <>
      <div className={styles["detail-header"]}>
        <h3 className={styles["no-margin-bottom"]}>
          update or delete category
        </h3>

        <CategoryDelete
          categoryId={category?.id as string}
          onSuccess={navigateToCategories}
        />
      </div>

      {category ? (
        <CategoryForm
          category={category}
          onSuccess={navigateToCategories}
          onCancel={goBack}
        />
      ) : (
        <div>category not found</div>
      )}
    </>
  );
};
