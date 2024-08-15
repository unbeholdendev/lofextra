export const getBitcoinVsCurrencyExchangeRate = async (
  currency: string,
  createdAt: number
) => {
  const ts = Math.floor(createdAt / 1000); // convert to seconds

  const from = ts - 60 * 60; // 60 minutes
  const to = ts;

  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=${currency}&from=${from}&to=${to}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return;
    }

    const exchangeRatesData = await response.json();

    const exchangeRate = Math.round(
      exchangeRatesData.prices?.[exchangeRatesData.prices.length - 1]?.[1]
    );

    return exchangeRate;
  } catch (err) {
    console.error(err);
  }
};
