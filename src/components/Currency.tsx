import React from "react";
import Image from "react-bootstrap/Image";

interface CurrencyProps {
  value: number;
  decimals?: number;
}

const Currency: React.FC<CurrencyProps> = ({ value, decimals = 2 }) => {
  return (
    <span>
      {value.toFixed(decimals)}{" "}
      <Image
        src="/assets/wollar.png"
        alt="wollars"
        style={{ width: "20px", marginBottom: "3px" }}
      />
    </span>
  );
};

export default Currency;
