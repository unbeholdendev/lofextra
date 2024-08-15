import { zodResolver } from "@hookform/resolvers/zod";
import {
  DatabaseMutationOperation,
  useLofikAccount,
  useLofikMutation,
} from "@lofik/react";
import Mexp from "math-expression-evaluator";
import { z, type TypeOf } from "zod";
import { AmountInput } from "../../../components/AmountInput";
import { CategoryPicker } from "../../../components/CategoryPicker";
import { CurrencyPicker } from "../../../components/CurrencyPicker";
import { Form } from "../../../components/Form";
import { Input } from "../../../components/Input";
import { SatsCheckbox } from "../../../components/SatsCheckbox";
import { getUnixTimestamp } from "../../../utils/dates";
import {
  RecurringTransactionRepeatInterval,
  type RecurringTransaction,
} from "../../../validators/types";
import { useConfigContext } from "../Config/ConfigContext";
import { SATS_IN_BTC, TableNames } from "../constants";
import styles from "./styles.module.css";

export type FormRecurringTransaction = Omit<
  RecurringTransaction,
  "id" | "amount" | "pubKeyHex" | "updatedAt" | "deletedAt" | "createdAt"
> & { id: string | null; amount: number | null; createdAt: number | null };

type Props = {
  recurringTransaction: FormRecurringTransaction;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const schema = z.object({
  title: z.string(),
  amount: z.string(),
  categoryId: z.string().nullable(),
  currency: z.string(),
  repeatDay: z
    .number()
    .gte(1, "Must be 1 of greater")
    .lte(28, "Must be 28 or lower"),
  repeatInterval: z.nativeEnum(RecurringTransactionRepeatInterval),
  inputSats: z.boolean().optional(),
});

type FormValues = TypeOf<typeof schema>;

const mexp = new Mexp();

export const RecurringTransactionForm = ({
  recurringTransaction,
  onSuccess,
  onCancel,
}: Props) => {
  const { pubKeyHex } = useLofikAccount();
  const { inputSats } = useConfigContext();

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess,
  });

  const onSubmit = ({
    categoryId,
    title,
    amount,
    repeatDay,
    repeatInterval,
    currency,
    inputSats,
  }: FormValues) => {
    let amountEval: number;

    try {
      amountEval = mexp.eval(amount);
    } catch (err) {
      alert(err);

      return;
    }

    const adjustedAmount = Math.abs(
      currency === "BTC" && inputSats ? amountEval / SATS_IN_BTC : amountEval
    );

    mutate({
      operation: DatabaseMutationOperation.Upsert,
      tableName: TableNames.RECURRING_TRANSACTIONS,
      columnDataMap: {
        id: recurringTransaction.id || crypto.randomUUID(),
        title,
        amount: adjustedAmount,
        pubKeyHex,
        categoryId: categoryId || null,
        currency,
        repeatDay,
        repeatInterval,
        deletedAt: null,
        createdAt: recurringTransaction.createdAt || getUnixTimestamp(),
      },
    });
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      resolver={zodResolver(schema)}
      defaultValues={{
        categoryId: recurringTransaction.categoryId,
        title: recurringTransaction.title,
        amount:
          (recurringTransaction.currency === "BTC" &&
          !inputSats &&
          !!recurringTransaction.amount
            ? recurringTransaction.amount * SATS_IN_BTC
            : recurringTransaction.amount
          )?.toString() ?? "",
        repeatDay: recurringTransaction.repeatDay,
        repeatInterval: recurringTransaction.repeatInterval,
        currency: recurringTransaction.currency,
        inputSats: !!inputSats,
      }}
      confirmModalProps={
        !recurringTransaction.id
          ? {
              enabled: true,
              children:
                "You won't be able to change repeat day and interval after creating.",
            }
          : undefined
      }
    >
      <fieldset>
        <Input
          name="title"
          placeholder="title"
          aria-label="title"
          autoFocus={!recurringTransaction.title}
        />

        <CategoryPicker name="categoryId" />

        <div role="group">
          <div className={`${styles["margin-right"]} ${styles.flex}`}>
            <AmountInput />
          </div>

          <div className={styles.flex}>
            <CurrencyPicker name="currency" />
          </div>

          <SatsCheckbox />
        </div>

        <div role="group">
          <div className={styles["margin-right"]}>
            <Input
              name="repeatDay"
              type="number"
              aria-label="repeat day"
              inputMode="numeric"
              min={1}
              max={28}
              options={{ valueAsNumber: true }}
              disabled={!!recurringTransaction.id}
            />
          </div>

          <Input name="repeatInterval" aria-label="repeat interval" disabled />
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
          {recurringTransaction.id ? "save" : "create"}
        </button>
      </div>
    </Form>
  );
};
