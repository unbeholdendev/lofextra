import { Form } from "@/components/Form";
import { Input } from "@/components/Input";
import { CopyIcon } from "@/components/icons/Copy";
import { useLofikAccount, useLofikAccountActions } from "@lofik/react";
import { UseFormReturn } from "react-hook-form";
import styles from "./styles.module.css";

type FormValues = {
  mnemonic: string;
};

export const Mnemonic = () => {
  const { currentMnemonic } = useLofikAccount();
  const { generateNewAccount, setAccountFromMnemonic } =
    useLofikAccountActions();

  const onSubmit = async (
    { mnemonic }: FormValues,
    methods: UseFormReturn<FormValues>
  ) => {
    await setAccountFromMnemonic(mnemonic);

    methods.reset({ mnemonic: "" });
  };

  return (
    <Form onSubmit={onSubmit} defaultValues={{ mnemonic: "" }}>
      <p>your mnemonic:</p>

      <p>
        <strong>{currentMnemonic}</strong>{" "}
        <CopyIcon
          className={styles.copy}
          onClick={() => navigator.clipboard.writeText(currentMnemonic)}
        />
      </p>

      <fieldset role="group">
        <Input
          name="mnemonic"
          aria-label="mnemonic"
          placeholder="mnemonic"
          className={styles.flex}
        />
      </fieldset>

      <div className={styles["flex-container"]}>
        <button
          type="button"
          onClick={generateNewAccount}
          className={`contrast ${styles["flex"]}`}
        >
          new account
        </button>

        <button type="submit" className={styles["flex"]}>
          set account
        </button>
      </div>
    </Form>
  );
};
