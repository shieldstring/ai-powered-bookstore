const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createPayPalCheckout,
  capturePayPalPayment,
  getPayPalCheckoutStatus,
  handlePayPalWebhook,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-paypal-order", protect, createPayPalCheckout);
router.post("/capture-paypal-order", protect, capturePayPalPayment);
router.get("/paypal-status/:paypalOrderId", protect, getPayPalCheckoutStatus);
router.post("/paypal-webhook", express.json(), handlePayPalWebhook);

module.exports = router;
