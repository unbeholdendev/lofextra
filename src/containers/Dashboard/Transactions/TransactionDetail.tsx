import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { QueryKeys } from "../../../queries";
import { transactionsSchema } from "../../../validators/validators";
import { routes } from "../routes";
import { TransactionDetailHeader } from "./TransactionDetailHeader";
import { TransactionForm } from "./TransactionForm";

const { useParams } = getRouteApi(routes.TRANSACTION_DETAIL);

export const TransactionDetail = () => {
  const params = useParams();
  const { pubKeyHex } = useLofikAccount();
  const router = useRouter();

  const { data } = useLofikQuery({
    sql: `
      SELECT * FROM transactions 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL
        AND id = '${params.id}'
      `,
    schema: transactionsSchema,
    queryKey: [QueryKeys.GET_TRANSACTION, pubKeyHex],
    enabled: !!params.id,
  });

  const transaction = data?.[0];

  const navigateToDashboard = () => router.navigate({ to: routes.DASHBOARD });
  const goBack = () => router.history.back();

  return (
    <>
      <TransactionDetailHeader
        transactionId={transaction?.id as string}
        onDeleteSuccess={navigateToDashboard}
        withMarginBottom
      />

      {transaction ? (
        <TransactionForm
          transaction={transaction}
          onSuccess={navigateToDashboard}
          onCancel={goBack}
        />
      ) : (
        <div>transaction not found</div>
      )}
    </>
  );
};
