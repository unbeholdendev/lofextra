import { type ReactNode } from "react";
import { Modal } from "./Modal";
import styles from "./styles.module.css";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  header?: string;
  children?: ReactNode;
};

export const ConfirmModal = ({
  onCancel,
  onConfirm,
  header,
  children,
}: Props) => (
  <Modal
    onClose={onCancel}
    header={<strong>{header || "Are you sure?"}</strong>}
  >
    <div className={styles.content}>{children}</div>

    <div className={styles["flex-container"]}>
      <button className={`contrast ${styles.flex}`} onClick={onCancel}>
        No
      </button>

      <button className={styles.flex} onClick={onConfirm}>
        Yes
      </button>
    </div>
  </Modal>
);
