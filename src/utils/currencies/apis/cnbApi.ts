import { formatDateForCnbApi } from "../../../utils/dates";

export const getCnbBaseCurrencyExchangeRate = async (
  baseCurrency: string,
  currency: string,
  createdAt: number
) => {
  // we need to use cors proxy to circumvent the cnbs cors policy
  const url =
    "https://corsproxy.io/?" +
    encodeURIComponent(
      `https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt?date=${formatDateForCnbApi(
        new Date(createdAt)
      )}`
    );

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return;
    }

    const exchangeRatesData = await response.text();

    const exchangeRates = parseResponse(exchangeRatesData);

    if (baseCurrency === "CZK" || currency === "CZK") {
      const exchangeRate =
        baseCurrency === "CZK"
          ? exchangeRates[currency].rate / exchangeRates[currency].unit
          : exchangeRates[baseCurrency].rate / exchangeRates[baseCurrency].unit;

      return baseCurrency === "CZK" ? exchangeRate : 1 / exchangeRate;
    }

    const { rate: baseCurrencyRate, unit: baseCurrencyUnit } =
      exchangeRates[baseCurrency];
    const { rate: currencyRate, unit: currencyUnit } = exchangeRates[currency];

    const adjustedBaseCurrencyRate = baseCurrencyRate / baseCurrencyUnit;
    const adjustedCurrencyRate = currencyRate / currencyUnit;

    return adjustedCurrencyRate / adjustedBaseCurrencyRate;
  } catch (err) {
    console.error(err);
  }
};

const parseResponse = (data: string) => {
  const lines = data.trim().split("\n");

  const currencies: Record<string, { rate: number; unit: number }> = {};

  for (let i = 2; i < lines.length; i++) {
    const parts = lines[i].split("|");
    const code = parts[3];
    const rate = parseFloat(parts[4].replace(",", "."));
    const unit = Number(parts[2]);

    currencies[code] = {
      rate,
      unit,
    };
  }

  return currencies;
};
