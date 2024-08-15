import {
  DatabaseMutationOperation,
  queryClient,
  useLofikMutation,
} from "@lofik/react";
import { useFormContext } from "react-hook-form";
import { useConfigContext } from "../containers/Dashboard/Config/ConfigContext";
import { QueryKeys, TableNames } from "../containers/Dashboard/constants";
import { useSkipFirstRenderEffect } from "../hooks/useSkipFirstRenderEffect";
import { Checkbox } from "./Checkbox";
import styles from "./styles.module.css";

const SatsCheckboxInner = () => {
  const config = useConfigContext();
  const { watch } = useFormContext();

  const inputSats = watch("inputSats");

  const { mutate } = useLofikMutation({
    shouldSync: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GET_CONFIG, config.pubKeyHex],
      });
    },
  });

  useSkipFirstRenderEffect(() => {
    mutate({
      operation: DatabaseMutationOperation.Upsert,
      tableName: TableNames.CONFIGS,
      columnDataMap: {
        ...config,
        inputSats: inputSats ? 1 : 0,
      },
      identifierColumn: "pubKeyHex",
    });
  }, [inputSats]);

  return <Checkbox name="inputSats" aria-label="sats" />;
};

export const SatsCheckbox = () => {
  const { watch } = useFormContext();

  const currency = watch("currency");

  return currency === "BTC" ? (
    <div className={styles["checkbox-wrapper"]}>
      <SatsCheckboxInner />
    </div>
  ) : null;
};
