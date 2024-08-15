import { type ReactNode } from "react";
import { Modal } from "./Modal";
import styles from "./styles.module.css";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  header?: string;
  children?: ReactNode;
  isLoading?: boolean;
};

export const ConfirmModal = ({
  onCancel,
  onConfirm,
  header,
  children,
  isLoading,
}: Props) => (
  <Modal
    onClose={onCancel}
    header={<strong>{header || "are you sure?"}</strong>}
  >
    <div className={styles.content}>{children}</div>

    <div className={styles["flex-container"]}>
      <button
        className={`contrast ${styles.flex}`}
        onClick={onCancel}
        disabled={isLoading}
      >
        no
      </button>

      <button className={styles.flex} onClick={onConfirm} disabled={isLoading}>
        yes
      </button>
    </div>
  </Modal>
);
