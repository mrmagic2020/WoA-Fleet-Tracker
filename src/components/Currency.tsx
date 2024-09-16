import React from "react";
import Image from "react-bootstrap/Image";

interface CurrencyProps {
  value: number;
  decimals?: number;
}

function addSeparator(nStr: string, thousands: string, decimal: string) {
  nStr += "";
  const x = nStr.split(".");
  let x1 = x[0];
  const x2 = x.length > 1 ? decimal + x[1] : "";
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + thousands + "$2");
  }
  return x1 + x2;
}

const Currency: React.FC<CurrencyProps> = ({ value, decimals = 2 }) => {
  return (
    <span>
      {addSeparator(value.toFixed(decimals), ",", ".")}
      <Image
        src="/assets/wollar.png"
        alt="wollars"
        style={{ width: "20px", marginBottom: "3px" }}
      />
    </span>
  );
};

export default Currency;
