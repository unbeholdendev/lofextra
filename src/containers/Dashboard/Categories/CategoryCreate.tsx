import { useRouter } from "@tanstack/react-router";
import { routes } from "../routes";
import { CategoryForm } from "./CategoryForm";

const newCategory = {
  id: null,
  title: "",
};

export const CategoryCreate = () => {
  const router = useRouter();

  const navigateToCategories = () => router.navigate({ to: routes.CATEGORIES });
  const goBack = () => router.history.back();

  return (
    <>
      <h3>create category</h3>

      <CategoryForm
        category={newCategory}
        onSuccess={navigateToCategories}
        onCancel={goBack}
      />
    </>
  );
};
