const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "GBP",
      uppercase: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    paypalOrderId: {
      type: String,
    },
    checkoutSessionId: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "referral",
        "mlm_commission",
        "withdrawal",
        "purchase",
        "refund",
        "other",
      ],
      default: "other",
    },
    description: {
      type: String,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
