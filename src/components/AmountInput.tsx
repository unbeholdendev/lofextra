import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useConfigContext } from "../containers/Dashboard/Config/ConfigContext";
import { SATS_IN_BTC } from "../containers/Dashboard/constants";
import { Input } from "./Input";

type Props = {
  name?: string;
};

export const AmountInput = ({ name = "amount" }: Props) => {
  const { inputSats } = useConfigContext();
  const { setValue, watch } = useFormContext();

  const amount = watch(name);
  const currency = watch("currency");

  useEffect(() => {
    if (currency !== "BTC" || !amount) {
      return;
    }

    setTimeout(() => {
      setValue(
        name,
        (!!inputSats
          ? Math.round(amount * SATS_IN_BTC)
          : amount / SATS_IN_BTC
        ).toString()
      );
    }, 0);
  }, [!!inputSats, currency]);

  return (
    <Input
      name={name}
      placeholder="5+5"
      aria-label={name}
      inputMode="tel"
      minLength={1}
    />
  );
};
