import { useCallback, useMemo } from "react";
import { useConfigContext } from "../../containers/Dashboard/Config/ConfigContext";
import {
  getAmountInCurrency,
  type GetAmountInCurrencyParams,
} from "../../utils/currencies/currencies";

export const useCurrencies = () => {
  const { baseCurrency: baseCurrencyConfig } = useConfigContext();

  const getAmountInCurrencyHook = useCallback(
    (
      params: Omit<GetAmountInCurrencyParams, "baseCurrency"> & {
        baseCurrency?: string;
      }
    ) =>
      getAmountInCurrency({
        ...params,
        baseCurrency: params.baseCurrency || baseCurrencyConfig,
      }),
    [baseCurrencyConfig]
  );

  return useMemo(
    () => ({ getAmountInCurrency: getAmountInCurrencyHook }),
    [getAmountInCurrencyHook]
  );
};
