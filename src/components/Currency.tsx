import React from "react";
import Image from "react-bootstrap/Image";

interface CurrencyProps {
  value: number;
}

const Currency: React.FC<CurrencyProps> = ({ value }) => {
  return (
    <span>
      {value}{" "}
      <Image
        src="/assets/wollar.png"
        alt="wollars"
        style={{ width: "20px", marginBottom: "3px" }}
      />
    </span>
  );
};

export default Currency;
