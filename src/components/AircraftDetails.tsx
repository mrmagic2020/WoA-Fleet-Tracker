import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAircraftById,
  createContract,
  logProfit,
  finishContract,
  deleteContract
} from "../services/AircraftService";
import { AirportCode, ContractType } from "shared/src/enums";
import { IAircraft, IAircraftContract } from "shared/src/interfaces";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import ProgressBar from "react-bootstrap/ProgressBar";
import { List } from "react-bootstrap/lib/Media";

const AircraftDetails: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [aircraft, setAircraft]: [IAircraft, React.Dispatch<any>] =
    useState<any>(null);
  const [newContract, setNewContract] = useState({
    contractType: "",
    player: "",
    destination: ""
  });
  const [newProfit, setNewProfit] = useState(NaN);
  const [hasActiveContract, setHasActiveContract] = useState(false);
  const [deletingContract, setDeletingContract] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchAircraft = async () => {
      const data = await getAircraftById(id);
      setAircraft(data);
      checkForActiveContract(data.contracts);
    };

    fetchAircraft();
  }, [id]);

  const checkForActiveContract = (contracts: any[]) => {
    if (contracts.length === 0) {
      setHasActiveContract(false);
      return;
    }
    const activeContract = contracts.some((contract) => !contract.finished);
    setHasActiveContract(activeContract);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewContract({ ...newContract, [name]: value });
  };

  const handleProfitChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { value } = e.target;
    setNewProfit(Number(value));
  };

  const handleCreateContract = async () => {
    if (!aircraft || hasActiveContract) return;
    const updatedAircraft = await createContract(id, newContract);
    newContract.contractType = "";
    newContract.player = "";
    newContract.destination = "";
    if (!updatedAircraft) return;
    setAircraft(updatedAircraft);
    checkForActiveContract(updatedAircraft.contracts);
  };

  const handleLogProfit = async (contractId: string) => {
    if (!aircraft) return;
    const updatedAircraft = await logProfit(id, contractId, newProfit);
    setAircraft(updatedAircraft);
    if (updatedAircraft) {
      checkForActiveContract(updatedAircraft.contracts);
    }
  };

  const handleFinishContract = async (contractId: string) => {
    if (!aircraft) return;
    const updatedAircraft = await finishContract(id, contractId);
    if (!updatedAircraft) return;
    setAircraft(updatedAircraft);
    checkForActiveContract(updatedAircraft.contracts);
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!aircraft) return;
    const updatedAircraft = await deleteContract(id, contractId);
    if (!updatedAircraft) return;
    setAircraft(updatedAircraft);
    checkForActiveContract(updatedAircraft.contracts);
  };

  if (!aircraft) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

  return (
    <Container fluid>
      <h1>Aircraft Details</h1>
      <Col xs={3}>
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
            {aircraft.contracts.reduce(
              (acc: number, contract: IAircraftContract) =>
                acc +
                contract.profits.reduce(
                  (acc: number, profit: number) => acc + profit,
                  0
                ),
              0
            )}
          </ListGroup.Item>
        </ListGroup>
      </Col>

      <h2>Contracts</h2>
      <Container
        fluid
        style={{
          width: "100%",
          display: "flex",
          overflowX: "auto"
        }}
      >
        <div className="d-flex flex-row flex-nowrap">
          {aircraft.contracts.map(
            (contract: IAircraftContract, index: number) => (
              <Card
                style={{
                  width: "18rem",
                  margin: "0.5rem"
                }}
                key={index}
              >
                <Card.Body>
                  <Card.Title>
                    {contract.destination}{" "}
                    {contract.finished ? (
                      <Badge bg="success">Finished</Badge>
                    ) : (
                      <Badge bg="warning">Active</Badge>
                    )}
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {contract.contractType}
                  </Card.Subtitle>
                  <br />
                  <Card.Text>
                    <ListGroup variant="flush">
                      {contract.contractType === ContractType.Player && (
                        <ListGroup.Item>
                          Player: {contract.player}
                        </ListGroup.Item>
                      )}
                      <ListGroup.Item>
                        Profits: {contract.profits.join(", ")}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        Mean Profit:{" "}
                        {contract.profits.length
                          ? contract.profits.reduce((a, b) => a + b) /
                            contract.profits.length
                          : 0}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        Total Profit:{" "}
                        {contract.profits.length
                          ? contract.profits.reduce((a, b) => a + b)
                          : 0}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        Progress:
                        {contract.contractType === ContractType.Player ? (
                          <ProgressBar
                            now={contract.progress * 10}
                            label={`${contract.progress * 10}%`}
                            striped
                            variant="info"
                          />
                        ) : (
                          ` ${contract.progress}`
                        )}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        {!contract.finished && (
                          <Form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleLogProfit(contract._id);
                            }}
                          >
                            <Row>
                              <Col>
                                <Form.Control
                                  type="number"
                                  size="sm"
                                  name="profit"
                                  value={newProfit}
                                  onChange={handleProfitChange}
                                  placeholder="Profit"
                                  required
                                  disabled={contract && contract.finished}
                                />
                              </Col>
                              <Col>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  type="submit"
                                  disabled={contract && contract.finished}
                                >
                                  Log Profit
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                      </ListGroup.Item>
                    </ListGroup>
                    {!contract.finished && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleFinishContract(contract._id)}
                      >
                        Finish Contract
                      </Button>
                    )}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setDeletingContract(contract);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete Contract
                    </Button>
                  </Card.Text>
                </Card.Body>
              </Card>
            )
          )}
        </div>
      </Container>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Contract</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete this contract? This action cannot be
            undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteContract(deletingContract._id);
              setShowDeleteModal(false);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <h2>Create New Contract</h2>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateContract();
        }}
      >
        <Row>
          <Col>
            <Form.Select
              name="contractType"
              value={newContract.contractType}
              onChange={handleInputChange}
              required
              disabled={hasActiveContract}
            >
              <option value="" disabled>
                Select Contract Type
              </option>
              {Object.values(ContractType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Col>
          {newContract.contractType === ContractType.Player && (
            <Col>
              <Form.Control
                type="text"
                name="player"
                value={newContract.player}
                onChange={handleInputChange}
                placeholder="Player Name"
                required
                disabled={hasActiveContract}
              />
            </Col>
          )}
          {newContract.contractType === ContractType.Player ? (
            <Col>
              <Form.Select
                name="destination"
                value={newContract.destination}
                onChange={handleInputChange}
                required
                disabled={hasActiveContract}
              >
                <option value="" disabled>
                  Select Destination
                </option>
                {Object.values(AirportCode).map((airport) => {
                  if (airport === aircraft.airport) return null;
                  return (
                    <option key={airport} value={airport}>
                      {airport}
                    </option>
                  );
                })}
              </Form.Select>
            </Col>
          ) : (
            <Col>
              <Form.Control
                type="text"
                name="destination"
                value={newContract.destination}
                onChange={handleInputChange}
                placeholder="Destination"
                required
                disabled={hasActiveContract}
              />
            </Col>
          )}
          <Col>
            <Button
              variant="outline-primary"
              type="submit"
              disabled={hasActiveContract}
            >
              Create Contract
            </Button>
          </Col>
        </Row>
        <br />
        {hasActiveContract && (
          <Alert key="warning" variant="warning">
            You cannot create a new contract while you have an active contract.
          </Alert>
        )}
      </Form>
    </Container>
  );
};

export default AircraftDetails;
