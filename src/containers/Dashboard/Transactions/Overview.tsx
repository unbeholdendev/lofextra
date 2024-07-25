import { type Dispatch, type SetStateAction } from "react";
import { getUnixTimestamp } from "../../../utils/dates";
import { formatNumber } from "../../../utils/formatters";
import type { ModalTransaction } from "./TransactionFormModal";
import styles from "./styles.module.css";

type Props = {
  total: number;
  setModalTransaction: Dispatch<SetStateAction<ModalTransaction | null>>;
};

export const Overview = ({ total, setModalTransaction }: Props) => {
  return (
    <div className={styles.overview}>
      <div>
        <div>last 30 days spent</div>
        <div className={styles.large}>
          <strong>{formatNumber(total || 0)}</strong>
        </div>
      </div>

      <button
        onClick={() =>
          setModalTransaction({
            id: null,
            title: "",
            amount: null,
            categoryId: "",
            createdAt: getUnixTimestamp(),
          })
        }
      >
        add expense
      </button>
    </div>
  );
};
