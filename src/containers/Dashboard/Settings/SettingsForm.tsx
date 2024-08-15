import {
  DatabaseMutationOperation,
  queryClient,
  useLofikAccount,
  useLofikMutation,
} from "@lofik/react";
import { useConfigContext } from "../Config/ConfigContext";
import { Currencies, QueryKeys, TableNames } from "../constants";
import styles from "./styles.module.css";

export const SettingsForm = () => {
  const { pubKeyHex } = useLofikAccount();
  const config = useConfigContext();

  const { mutate } = useLofikMutation({
    shouldSync: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GET_CONFIG, pubKeyHex],
      });
    },
  });

  const currency = Currencies[config.baseCurrency as keyof typeof Currencies];

  const handleSubmit = (showSats: boolean) => {
    mutate({
      operation: DatabaseMutationOperation.Upsert,
      tableName: TableNames.CONFIGS,
      columnDataMap: {
        ...config,
        showSats: showSats ? 1 : 0,
      },
      identifierColumn: "pubKeyHex",
    });
  };

  return (
    <div className={styles["margin-bottom"]}>
      <h3>settings</h3>

      <label>base currency</label>
      <input
        type="text"
        value={`${config.baseCurrency} - ${currency}`}
        readOnly
        aria-describedby="info"
      />
      <small id="info">
        base currency cannot be changed in the current version
      </small>

      <label>
        <input
          type="checkbox"
          role="switch"
          onChange={(e) => handleSubmit(e.target.checked)}
          defaultChecked={!!config.showSats}
        />
        display bitcoin amounts in sats
      </label>
    </div>
  );
};
