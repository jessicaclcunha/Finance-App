export const CURRENCIES = {
  EUR: { symbol: "€", label: "Euro (€)", position: "suffix" },
  USD: { symbol: "$", label: "Dólar americano (US$)", position: "prefix" },
  GBP: { symbol: "£", label: "Libra esterlina (£)", position: "prefix" },
  BRL: { symbol: "R$", label: "Real brasileiro (R$)", position: "prefix" },
};

export const DEFAULT_CURRENCY = "EUR";

export const currencySymbol = (code = DEFAULT_CURRENCY) =>
  (CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY]).symbol;


export const formatCurrency = (value, code = DEFAULT_CURRENCY, options = {}) => {
  const { decimals = 2, showSign = false } = options;
  const cur = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  const n = Number(value) || 0;
  const abs = Math.abs(n).toFixed(decimals);
  const amountStr = cur.position === "prefix" ? `${cur.symbol}${abs}` : `${abs}${cur.symbol}`;

  if (showSign) {
    const sign = n > 0 ? "+" : n < 0 ? "−" : "";
    return `${sign}${amountStr}`;
  }
  return n < 0 ? `-${amountStr}` : amountStr;
};