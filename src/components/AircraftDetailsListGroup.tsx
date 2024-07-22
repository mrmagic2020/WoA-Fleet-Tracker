import React from "react";
import {
  IAircraft,
  IAircraftContract
} from "@mrmagic2020/shared/dist/interfaces";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Currency from "./Currency";

interface AircraftDetailsListGroupProps {
  aircraft: IAircraft;
  customItems?: JSX.Element[];
}

const AircraftDetailsListGroup: React.FC<AircraftDetailsListGroupProps> = ({
  aircraft,
  customItems
}) => {
  return (
    <Col xs="auto">
      <ListGroup>
        <ListGroup.Item>Model: {aircraft.ac_model}</ListGroup.Item>
        <ListGroup.Item>Size: {aircraft.size}</ListGroup.Item>
        <ListGroup.Item>Type: {aircraft.type}</ListGroup.Item>
        <ListGroup.Item>Registration: {aircraft.registration}</ListGroup.Item>
        <ListGroup.Item>Airport: {aircraft.airport}</ListGroup.Item>
        <ListGroup.Item>Status: {aircraft.status}</ListGroup.Item>
        <ListGroup.Item>
          Total Contracts: {aircraft.contracts.length}
        </ListGroup.Item>
        <ListGroup.Item>
          Total Income:{" "}
          <Currency
            value={aircraft.contracts.reduce(
              (acc: number, contract: IAircraftContract) =>
                acc +
                contract.profits.reduce(
                  (acc: number, profit: number) => acc + profit,
                  0
                ),
              0
            )}
          />
        </ListGroup.Item>
        {customItems &&
          customItems.map((item, index) => (
            <ListGroup.Item key={index}>{item}</ListGroup.Item>
          ))}
      </ListGroup>
    </Col>
  );
};

export default AircraftDetailsListGroup;
