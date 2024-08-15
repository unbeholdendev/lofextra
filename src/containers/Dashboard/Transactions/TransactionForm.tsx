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
import { useCurrencies } from "../../../hooks/currencies/useCurrencies";
import {
  appendSecondsAndMilis,
  formatDateForInput,
  getDateFromTimestamp,
  getUnixTimestamp,
} from "../../../utils/dates";
import { refetchQueries } from "../../../utils/refetchQueries";
import { type Transaction as TransactionType } from "../../../validators/types";
import { useConfigContext } from "../Config/ConfigContext";
import { SATS_IN_BTC, TableNames } from "../constants";
import styles from "./styles.module.css";

export type FormTransaction = Omit<
  TransactionType,
  "id" | "amount" | "baseAmount" | "pubKeyHex" | "updatedAt" | "deletedAt"
> & { id: string | null; amount: number | null; baseAmount: number | null };

type Props = {
  transaction: FormTransaction;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const schema = z.object({
  title: z.string(),
  amount: z.string(),
  categoryId: z.string().nullable(),
  createdAt: z.string(),
  currency: z.string(),
  inputSats: z.boolean().optional(),
});

type FormValues = TypeOf<typeof schema>;

const mexp = new Mexp();

export const TransactionForm = ({
  transaction,
  onSuccess,
  onCancel,
}: Props) => {
  const { pubKeyHex } = useLofikAccount();
  const { getAmountInCurrency } = useCurrencies();
  const { inputSats } = useConfigContext();

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {
      refetchQueries();

      onSuccess?.();
    },
  });

  const onSubmit = async ({
    categoryId,
    title,
    amount,
    createdAt: createdAtValue,
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

    const createdAt = getUnixTimestamp(
      new Date(appendSecondsAndMilis(transaction.createdAt, createdAtValue))
    );

    const adjustedAmount = Math.abs(
      currency === "BTC" && inputSats ? amountEval / SATS_IN_BTC : amountEval
    );

    const baseAmount =
      transaction.amount !== adjustedAmount ||
      transaction.currency !== currency ||
      transaction.createdAt !== createdAt
        ? await getAmountInCurrency({
            amount: adjustedAmount,
            createdAt,
            currency,
          })
        : transaction.baseAmount;

    if (!baseAmount) {
      return;
    }

    mutate({
      operation: DatabaseMutationOperation.Upsert,
      tableName: TableNames.TRANSACTIONS,
      columnDataMap: {
        id: transaction.id || crypto.randomUUID(),
        title,
        amount: adjustedAmount,
        pubKeyHex,
        currency,
        baseAmount,
        categoryId: categoryId || null,
        deletedAt: null,
        createdAt,
      },
    });
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      resolver={zodResolver(schema)}
      defaultValues={{
        categoryId: transaction.categoryId,
        createdAt: formatDateForInput(
          getDateFromTimestamp(transaction.createdAt)
        ),
        title: transaction.title,
        amount:
          (transaction.currency === "BTC" && !inputSats && !!transaction.amount
            ? transaction.amount * SATS_IN_BTC
            : transaction.amount
          )?.toString() ?? "",
        currency: transaction.currency,
        inputSats: !!inputSats,
      }}
    >
      <fieldset>
        <Input
          name="title"
          placeholder="title"
          aria-label="title"
          autoFocus={!transaction.title}
        />

        <div role="group">
          <div className={`${styles["margin-right"]} ${styles.flex}`}>
            <CategoryPicker name="categoryId" />
          </div>

          <div className={styles.flex}>
            <Input name="createdAt" aria-label="date" type="datetime-local" />
          </div>
        </div>

        <div role="group">
          <div className={`${styles["margin-right"]} ${styles.flex}`}>
            <AmountInput />
          </div>

          <div className={styles.flex}>
            <CurrencyPicker name="currency" />
          </div>

          <SatsCheckbox />
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
