import styles from "./styles.module.css";
import { TransactionDelete } from "./TransactionDelete";

type Props = {
  transactionId: string;
  onDeleteSuccess: () => void;
  withMarginBottom?: boolean;
};

export const TransactionDetailHeader = ({
  transactionId,
  onDeleteSuccess,
  withMarginBottom,
}: Props) => {
  return (
    <div
      className={`${styles["modal-header"]} ${
        withMarginBottom ? styles["header-margin-bottom"] : ""
      }`}
    >
      <h3 className={styles["no-margin-bottom"]}>
        update or delete transaction
      </h3>

      <TransactionDelete
        transactionId={transactionId}
        onSuccess={onDeleteSuccess}
      />
    </div>
  );
};
