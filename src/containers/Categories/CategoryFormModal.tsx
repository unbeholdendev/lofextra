import { Form } from "@/components/Form";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Category as CategoryType } from "@/validators/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DatabaseMutationOperation,
  useLofikAccount,
  useLofikMutation,
} from "@lofik/react";
import { TypeOf, z } from "zod";
import styles from "./styles.module.css";

export type ModalCategory = Omit<
  CategoryType,
  "id" | "pubKeyHex" | "updatedAt" | "deletedAt" | "createdAt"
> & { id: string | null; createdAt?: number };

type Props = {
  category: ModalCategory;
  onSuccess: () => void;
  onClose: () => void;
};

const schema = z.object({
  title: z.string().min(1),
});

type FormValues = TypeOf<typeof schema>;

export const CategoryFormModal = ({ category, onSuccess, onClose }: Props) => {
  const { pubKeyHex } = useLofikAccount();

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {
      onSuccess();

      onClose();
    },
  });

  const onSubmit = async ({ title }: FormValues) => {
    mutate({
      operation: DatabaseMutationOperation.Upsert,
      tableName: "categories",
      columnDataMap: {
        id: category.id || crypto.randomUUID(),
        title,
        pubKeyHex,
        deletedAt: null,
        createdAt: category.createdAt || Date.now(),
      },
    });
  };

  return (
    <Modal
      onClose={onClose}
      header={
        <strong>{category.id ? "update category" : "add category"}</strong>
      }
    >
      <Form<FormValues>
        onSubmit={onSubmit}
        resolver={zodResolver(schema)}
        values={{
          title: category.title,
        }}
      >
        <fieldset>
          <Input name="title" placeholder="title" aria-label="title" />
        </fieldset>

        <div className={styles["flex-container"]}>
          <button className={styles.flex} type="submit">
            {category.id ? "save" : "add"}
          </button>
        </div>
      </Form>
    </Modal>
  );
};
