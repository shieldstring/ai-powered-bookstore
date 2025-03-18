import React from 'react';
import { useSelector } from 'react-redux';

const TokenReward = () => {
  const tokens = useSelector((state) => state.user.tokens);

  return (
    <div className="token-reward">
      <h3>Your Tokens: {tokens}</h3>
      <button>Redeem Tokens</button>
    </div>
  );
};

export default TokenReward;