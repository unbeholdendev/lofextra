import { Modal } from "@/components/Modal";
import styles from "./styles.module.css";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal = ({ onCancel, onConfirm }: Props) => (
  <Modal onClose={onCancel} header={<strong>Are you sure?</strong>}>
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
