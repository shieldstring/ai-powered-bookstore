const express = require("express");
const {
  getSupportedCurrencies,
  getRates,
  convertAmount,
} = require("../controllers/currencyController");

const router = express.Router();

router.get("/supported", getSupportedCurrencies);
router.get("/rates", getRates);
router.get("/convert", convertAmount);

module.exports = router;
