const {
  SUPPORTED_CURRENCIES,
  BASE_CURRENCY,
  getExchangeRates,
  convertFromBase,
  convertToBase,
  normalizeCurrency,
  roundPrice,
} = require("../utils/currency");

const getSupportedCurrencies = (req, res) => {
  res.json({
    baseCurrency: BASE_CURRENCY,
    currencies: Object.values(SUPPORTED_CURRENCIES),
  });
};

const getRates = (req, res) => {
  res.json({
    baseCurrency: BASE_CURRENCY,
    rates: getExchangeRates(),
    updatedAt: new Date().toISOString(),
  });
};

const convertAmount = (req, res) => {
  const { amount, from = BASE_CURRENCY, to = BASE_CURRENCY } = req.query;
  const num = parseFloat(amount);

  if (Number.isNaN(num) || num < 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const fromCurrency = normalizeCurrency(from);
  const toCurrency = normalizeCurrency(to);
  const inBase = fromCurrency === BASE_CURRENCY ? num : convertToBase(num, fromCurrency);
  const converted = convertFromBase(inBase, toCurrency);

  res.json({
    amount: num,
    from: fromCurrency,
    to: toCurrency,
    converted: roundPrice(converted),
    rate: roundPrice(converted / num),
  });
};

module.exports = {
  getSupportedCurrencies,
  getRates,
  convertAmount,
};
