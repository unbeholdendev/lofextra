import { useNavigate } from "@tanstack/react-router";
import { useFormatCurrency } from "../../../hooks/useFormatCurrency";
import { routes } from "../routes";
import styles from "./styles.module.css";

type Props = {
  total: number;
};

export const Overview = ({ total }: Props) => {
  const navigate = useNavigate();
  const { formatCurrency } = useFormatCurrency();

  return (
    <div className={styles.overview}>
      <div>
        <div>spent in last 30 days</div>
        <div className={styles.large}>
          <strong>{formatCurrency(total || 0)}</strong>
        </div>
      </div>

      <button onClick={() => navigate({ to: routes.TRANSACTION_CREATE })}>
        create transaction
      </button>
    </div>
  );
};
