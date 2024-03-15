import { getUnixTimestamp } from "@/utils/dates";
import { Dispatch, SetStateAction } from "react";
import { ModalTransaction } from "./TransactionFormModal";
import styles from "./styles.module.css";

type Props = {
  total: number;
  setModalTransaction: Dispatch<SetStateAction<ModalTransaction | null>>;
};

export const Overview = ({ total, setModalTransaction }: Props) => {
  return (
    <div className={styles.overview}>
      <div>
        <div>Last 30 days spent:</div>
        <div>
          <strong>{total || 0}</strong>
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
