const axios = require("axios");

const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let cachedToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const { data } = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
};

const paypalRequest = async (method, path, body) => {
  const token = await getAccessToken();
  const { data } = await axios({
    method,
    url: `${PAYPAL_API}${path}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: body,
  });
  return data;
};

const createPayPalOrder = async ({
  orderId,
  amount,
  currency,
  items,
  returnUrl,
  cancelUrl,
}) => {
  const purchaseUnit = {
    reference_id: orderId,
    amount: {
      currency_code: currency,
      value: amount,
      breakdown: {
        item_total: {
          currency_code: currency,
          value: amount,
        },
      },
    },
  };

  if (items?.length) {
    purchaseUnit.items = items.map((item) => ({
      name: item.name?.substring(0, 127) || "Item",
      quantity: String(item.quantity),
      unit_amount: {
        currency_code: currency,
        value: item.unitAmount,
      },
    }));
  }

  const order = await paypalRequest("POST", "/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [purchaseUnit],
    application_context: {
      brand_name: "Wisdom Peters",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  });

  const approveLink = order.links?.find((link) => link.rel === "approve");
  return {
    id: order.id,
    status: order.status,
    approvalUrl: approveLink?.href,
  };
};

const capturePayPalOrder = async (paypalOrderId) => {
  return paypalRequest("POST", `/v2/checkout/orders/${paypalOrderId}/capture`, {});
};

const getPayPalOrder = async (paypalOrderId) => {
  return paypalRequest("GET", `/v2/checkout/orders/${paypalOrderId}`, undefined);
};

module.exports = {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrder,
};
