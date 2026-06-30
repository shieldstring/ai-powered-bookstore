const BASE_CURRENCY = "GBP";
const MAX_PRODUCT_PRICE = 999.99;

const SUPPORTED_CURRENCIES = {
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
  USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
  NGN: { code: "NGN", symbol: "₦", locale: "en-NG", name: "Nigerian Naira" },
};

const DEFAULT_RATES = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  NGN: 1950,
};

const getExchangeRates = () => {
  const rates = { ...DEFAULT_RATES };
  if (process.env.EXCHANGE_RATE_USD) rates.USD = parseFloat(process.env.EXCHANGE_RATE_USD);
  if (process.env.EXCHANGE_RATE_EUR) rates.EUR = parseFloat(process.env.EXCHANGE_RATE_EUR);
  if (process.env.EXCHANGE_RATE_NGN) rates.NGN = parseFloat(process.env.EXCHANGE_RATE_NGN);
  return rates;
};

const roundPrice = (amount) => Math.round(amount * 100) / 100;

const normalizeCurrency = (currency) => {
  const code = (currency || BASE_CURRENCY).toUpperCase();
  return SUPPORTED_CURRENCIES[code] ? code : BASE_CURRENCY;
};

const convertFromBase = (amountInBase, toCurrency) => {
  const rates = getExchangeRates();
  const target = normalizeCurrency(toCurrency);
  if (target === BASE_CURRENCY) return roundPrice(amountInBase);
  return roundPrice(amountInBase * rates[target]);
};

const convertToBase = (amount, fromCurrency) => {
  const rates = getExchangeRates();
  const source = normalizeCurrency(fromCurrency);
  if (source === BASE_CURRENCY) return roundPrice(amount);
  return roundPrice(amount / rates[source]);
};

const applyCurrencyToBook = (book, currency) => {
  if (!book) return book;
  const target = normalizeCurrency(currency);
  const result = { ...book };
  if (result.price != null) {
    result.priceGBP = result.price;
    result.price = convertFromBase(result.price, target);
  }
  if (result.originalPrice != null) {
    result.originalPriceGBP = result.originalPrice;
    result.originalPrice = convertFromBase(result.originalPrice, target);
  }
  result.currency = target;
  return result;
};

const applyCurrencyToBooks = (books, currency) =>
  books.map((book) => applyCurrencyToBook(book, currency));

const formatPayPalAmount = (amount) => roundPrice(amount).toFixed(2);

const isValidProductPrice = (price) => {
  const num = parseFloat(price);
  return !Number.isNaN(num) && num > 0 && num <= MAX_PRODUCT_PRICE;
};

module.exports = {
  BASE_CURRENCY,
  MAX_PRODUCT_PRICE,
  SUPPORTED_CURRENCIES,
  getExchangeRates,
  roundPrice,
  normalizeCurrency,
  convertFromBase,
  convertToBase,
  applyCurrencyToBook,
  applyCurrencyToBooks,
  formatPayPalAmount,
  isValidProductPrice,
};
