import { zodResolver } from "@hookform/resolvers/zod";
import {
  DatabaseMutationOperation,
  sqlocal,
  useLofikAccount,
  useLofikMutation,
} from "@lofik/react";
import { type TypeOf, z } from "zod";
import { Form } from "../../../components/Form";
import { Input } from "../../../components/Input";
import { type Category as CategoryType } from "../../../validators/types";
import { TableNames } from "../constants";
import styles from "./styles.module.css";

export type ModalCategory = Omit<
  CategoryType,
  "id" | "pubKeyHex" | "updatedAt" | "deletedAt" | "createdAt" | "sortOrder"
> & { id: string | null; sortOrder?: number; createdAt?: number };

type Props = {
  category: ModalCategory;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const schema = z.object({
  title: z.string().min(1),
});

type FormValues = TypeOf<typeof schema>;

export const CategoryForm = ({ category, onSuccess, onCancel }: Props) => {
  const { pubKeyHex } = useLofikAccount();

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess,
  });

  const onSubmit = async ({ title }: FormValues) => {
    const categoriesSortOrder = await sqlocal.sql(
      `SELECT MAX(sortOrder) AS 'maxSortOrder' FROM categories WHERE pubKeyHex = '${pubKeyHex}' AND deletedAt IS NULL`
    );

    mutate({
      operation: DatabaseMutationOperation.Upsert,
      tableName: TableNames.CATEGORIES,
      columnDataMap: {
        id: category.id || crypto.randomUUID(),
        title,
        pubKeyHex,
        sortOrder:
          category.sortOrder || categoriesSortOrder[0].maxSortOrder + 1,
        deletedAt: null,
        createdAt: category.createdAt || Date.now(),
      },
    });
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      resolver={zodResolver(schema)}
      defaultValues={{
        title: category.title,
      }}
    >
      <fieldset>
        <Input
          name="title"
          placeholder="title"
          aria-label="title"
          autoFocus={!category.title}
        />
      </fieldset>

      <div className={styles["flex-container"]}>
        <button
          type="button"
          className={`contrast ${styles.flex}`}
          onClick={onCancel}
        >
          cancel
        </button>

        <button className={styles.flex} type="submit">
          {category.id ? "save" : "add"}
        </button>
      </div>
    </Form>
  );
};
