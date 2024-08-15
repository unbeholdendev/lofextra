import { zodResolver } from "@hookform/resolvers/zod";
import {
  DatabaseMutationOperation,
  queryClient,
  sqlocal,
  useLofikAccount,
  useLofikMutation,
  type GenerateDatabaseMutation,
} from "@lofik/react";
import { z, type TypeOf } from "zod";
import { CurrencyPicker } from "../../../components/CurrencyPicker";
import { Form } from "../../../components/Form";
import { Modal } from "../../../components/Modal";
import { useFullServerSync } from "../../../hooks/useFullServerSync";
import { getUnixTimestamp } from "../../../utils/dates";
import { QueryKeys, TableNames } from "../constants";

const schema = z.object({
  baseCurrency: z.string(),
});

type FormValues = TypeOf<typeof schema>;

export const ConfigModalForm = () => {
  const { pubKeyHex } = useLofikAccount();
  const { handleFullServerSync, isLoading } = useFullServerSync();

  const { mutateAsync, isPending } = useLofikMutation({
    shouldSync: false,
  });

  const handleSubmit = async ({ baseCurrency }: FormValues) => {
    await mutateAsync({
      operation: DatabaseMutationOperation.Upsert,
      tableName: TableNames.CONFIGS,
      identifierColumn: "pubKeyHex",
      columnDataMap: {
        pubKeyHex,
        baseCurrency,
        createdAt: getUnixTimestamp(),
      },
    });

    const mutations: GenerateDatabaseMutation[] = [];

    const transactions = await sqlocal.sql(
      `SELECT * FROM transactions WHERE deletedAt IS NULL AND pubKeyHex = '${pubKeyHex}'`
    );

    for (const transaction of transactions) {
      mutations.push({
        operation: DatabaseMutationOperation.Upsert,
        tableName: TableNames.TRANSACTIONS,
        columnDataMap: {
          ...transaction,
          currency: baseCurrency,
          baseAmount: transaction.amount,
          updatedAt: getUnixTimestamp(),
        },
      });
    }

    const recurringTransactions = await sqlocal.sql(
      `SELECT * FROM recurringTransactions WHERE deletedAt IS NULL AND pubKeyHex = '${pubKeyHex}'`
    );

    for (const recurringTransaction of recurringTransactions) {
      mutations.push({
        operation: DatabaseMutationOperation.Upsert,
        tableName: TableNames.RECURRING_TRANSACTIONS,
        columnDataMap: {
          ...recurringTransaction,
          currency: baseCurrency,
          updatedAt: getUnixTimestamp(),
        },
      });
    }

    await mutateAsync(mutations);

    await handleFullServerSync();

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.GET_CONFIG, pubKeyHex],
    });
  };

  return (
    <Modal header={<strong>select base currency</strong>} onClose={() => {}}>
      <p>
        this will be your default currency. foreign transactions will be
        denominated in it. in the current version it can NOT be changed so pick
        carefully.
      </p>

      <Form<FormValues>
        onSubmit={handleSubmit}
        resolver={zodResolver(schema)}
        defaultValues={{
          baseCurrency: "CZK",
        }}
        confirmModalProps={{
          enabled: true,
          header: "are you sure? no changes in the future!",
          isLoading: isPending || isLoading,
        }}
      >
        <CurrencyPicker name="baseCurrency" label="base currency" />

        <button type="submit">save</button>
      </Form>
    </Modal>
  );
};
