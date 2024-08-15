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
import { getUnixTimestamp } from "../../../utils/dates";
import { QueryKeys, TableNames } from "../constants";

const schema = z.object({
  baseCurrency: z.string(),
});

type FormValues = TypeOf<typeof schema>;

export const ConfigModalForm = () => {
  const { pubKeyHex } = useLofikAccount();

  const { mutate, isPending, error } = useLofikMutation({
    shouldSync: true,
  });

  const handleSubmit = ({ baseCurrency }: FormValues) => {
    mutate(
      {
        operation: DatabaseMutationOperation.Upsert,
        tableName: TableNames.CONFIGS,
        identifierColumn: "pubKeyHex",
        columnDataMap: {
          pubKeyHex,
          baseCurrency,
          createdAt: getUnixTimestamp(),
        },
      },
      {
        onSuccess: async () => {
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

          if (!!mutations.length) {
            mutate(mutations, {
              onSuccess: () => {
                queryClient.invalidateQueries({
                  queryKey: [QueryKeys.GET_CONFIG, pubKeyHex],
                });
              },
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: [QueryKeys.GET_CONFIG, pubKeyHex],
            });
          }
        },
      }
    );
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
          isLoading: isPending,
        }}
      >
        <CurrencyPicker name="baseCurrency" label="base currency" />

        <button type="submit">save</button>
      </Form>
    </Modal>
  );
};
