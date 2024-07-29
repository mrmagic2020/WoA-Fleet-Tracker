import React from "react";
import {
  IAircraft,
  IAircraftContract
} from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Image from "react-bootstrap/Image";
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
    <Container fluid>
      <Row>
        <Col>
          <ListGroup>
            <ListGroup.Item>Model: {aircraft.ac_model}</ListGroup.Item>
            <ListGroup.Item>Size: {aircraft.size}</ListGroup.Item>
            <ListGroup.Item>Type: {aircraft.type}</ListGroup.Item>
            <ListGroup.Item>
              Registration: {aircraft.registration}
            </ListGroup.Item>
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
        <Col xs="auto">
          <Image
            width={400}
            src={`/assets/aircraft/${aircraft.ac_model}.jpeg`}
            alt={aircraft.ac_model}
            rounded
          />
        </Col>
      </Row>
    </Container>
  );
};

export default AircraftDetailsListGroup;
