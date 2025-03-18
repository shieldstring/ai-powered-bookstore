import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripeCheckout = ({ amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await loadStripe('your-publishable-key');

    const response = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    const { clientSecret } = await response.json();

    const result = await stripe.confirmPayment({
      clientSecret,
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing...' : `Pay $${amount}`}
    </button>
  );
};

export default StripeCheckout;