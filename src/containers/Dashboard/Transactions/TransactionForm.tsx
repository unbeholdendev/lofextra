import { zodResolver } from "@hookform/resolvers/zod";
import {
  DatabaseMutationOperation,
  useLofikAccount,
  useLofikMutation,
} from "@lofik/react";
import Mexp from "math-expression-evaluator";
import { z, type TypeOf } from "zod";
import { CategoryPicker } from "../../../components/CategoryPicker";
import { Form } from "../../../components/Form";
import { Input } from "../../../components/Input";
import { useRefetchQueries } from "../../../hooks/useRefetchQueries";
import {
  appendSecondsAndMilis,
  formatDateForInput,
  getDateFromTimestamp,
  getUnixTimestamp,
} from "../../../utils/dates";
import { type Transaction as TransactionType } from "../../../validators/types";
import styles from "./styles.module.css";

export type FormTransaction = Omit<
  TransactionType,
  "id" | "amount" | "pubKeyHex" | "currency" | "updatedAt" | "deletedAt"
> & { id: string | null; amount: number | null };

type Props = {
  transaction: FormTransaction;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const schema = z.object({
  title: z.string().min(1),
  amount: z.string(),
  categoryId: z.string().nullable(),
  createdAt: z.string(),
});

type FormValues = TypeOf<typeof schema>;

const mexp = new Mexp();

export const TransactionForm = ({
  transaction,
  onSuccess,
  onCancel,
}: Props) => {
  const { pubKeyHex } = useLofikAccount();

  const refetchQueries = useRefetchQueries();
  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {
      refetchQueries();

      onSuccess?.();
    },
  });

  const onSubmit = ({ categoryId, title, amount, createdAt }: FormValues) => {
    let amountEval: number;

    try {
      amountEval = mexp.eval(amount);
    } catch (err) {
      alert(err);

      return;
    }

    mutate({
      operation: DatabaseMutationOperation.Upsert,
      tableName: "transactions",
      columnDataMap: {
        id: transaction.id || crypto.randomUUID(),
        title,
        amount: Math.abs(amountEval),
        pubKeyHex,
        categoryId: categoryId || null,
        deletedAt: null,
        createdAt: getUnixTimestamp(
          new Date(appendSecondsAndMilis(transaction.createdAt, createdAt))
        ),
      },
    });
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      resolver={zodResolver(schema)}
      values={{
        categoryId: transaction.categoryId,
        createdAt: formatDateForInput(
          getDateFromTimestamp(transaction.createdAt)
        ),
        title: transaction.title,
        amount: transaction.amount?.toString() ?? "",
      }}
    >
      <fieldset>
        <Input name="title" placeholder="title" aria-label="title" />

        <Input name="createdAt" aria-label="date" type="datetime-local" />

        <div role="group">
          <div className={styles["margin-right"]}>
            <CategoryPicker name="categoryId" />
          </div>

          <Input
            name="amount"
            placeholder="5+5"
            aria-label="amount"
            inputMode="tel"
          />
        </div>
      </fieldset>

      <div className={styles["flex-container"]}>
        <button
          type="button"
          className={`contrast ${styles.flex} ${styles["no-margin-bottom"]}`}
          onClick={onCancel}
        >
          cancel
        </button>

        <button
          className={`${styles.flex} ${styles["no-margin-bottom"]}`}
          type="submit"
        >
          {transaction.id ? "save" : "create"}
        </button>
      </div>
    </Form>
  );
};
