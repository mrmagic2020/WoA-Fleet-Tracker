import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAircraftById,
  createContract,
  logProfit,
  finishContract,
  deleteContract,
  updateAircraft
} from "../services/AircraftService";
import {
  getAircraftGroupById,
  getAircraftGroups,
  updateAircraftGroup
} from "../services/AircraftGroupService";
import {
  AircraftStatus,
  AirportCode,
  ContractType
} from "@mrmagic2020/shared/dist/enums";
import {
  IAircraft,
  IAircraftContract,
  IAircraftGroup
} from "@mrmagic2020/shared/dist/interfaces";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import AircraftDetailsListGroup from "./AircraftDetailsListGroup";
import AircraftContractList from "./AircraftContractList";
import Currency from "./Currency";

const AircraftDetails: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [aircraft, setAircraft]: [IAircraft, React.Dispatch<any>] =
    useState<any>(null);
  const [aircraftGroupList, setAircraftGroupList] = useState<IAircraftGroup[]>(
    []
  );
  const [aircraftGroup, setAircraftGroup] = useState<IAircraftGroup | null>(
    null
  );
  const [newContract, setNewContract] = useState({
    contractType: "",
    player: "",
    destination: ""
  });
  const [hasActiveContract, setHasActiveContract] = useState(false);

  useEffect(() => {
    const fetchAircraft = async () => {
      const data = await getAircraftById(id);
      setAircraft(data);
      checkForActiveContract(data.contracts);
    };
    const fetchAircraftGroupList = async () => {
      const data = await getAircraftGroups();
      setAircraftGroupList(data);
    };

    fetchAircraft();
    fetchAircraftGroupList();
  }, [id]);

  useEffect(() => {
    const fetchAircraftGroup = async () => {
      if (!aircraft || !aircraft.aircraftGroup) return;
      const data = await getAircraftGroupById(aircraft.aircraftGroup as any);
      setAircraftGroup(data);
    };

    fetchAircraftGroup();
  }, [aircraft]);

  const checkForActiveContract = (contracts: any[]) => {
    if (contracts.length === 0) {
      setHasActiveContract(false);
      return;
    }
    const activeContract = contracts.some((contract) => !contract.finished);
    setHasActiveContract(activeContract);
  };

  const handleGroupChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGroupId = e.target.value;
    if (!aircraft) return;
    const updatedAircraft = {
      ...aircraft,
      aircraftGroup: (newGroupId === "" ? null : newGroupId) as any
    };
    setAircraft(updatedAircraft);
    await updateAircraft(id, { aircraftGroup: updatedAircraft.aircraftGroup });

    // If the aircraft was previously in a group, remove it from that group
    if (aircraft.aircraftGroup) {
      const oldGroup = await getAircraftGroupById(
        aircraft.aircraftGroup as any
      );
      const updatedOldGroup = {
        ...oldGroup,
        aircrafts: oldGroup.aircrafts.filter((ac) => ac !== (id as any))
      };
      await updateAircraftGroup(oldGroup._id, updatedOldGroup);
    }

    // If the aircraft is being moved to a group, add it to that group
    if (newGroupId !== "") {
      const newGroup = await getAircraftGroupById(newGroupId);
      const updatedNewGroup = {
        ...newGroup,
        aircrafts: [...newGroup.aircrafts, id as any]
      };
      const finalNewGroup = await updateAircraftGroup(
        newGroupId,
        updatedNewGroup
      );
      setAircraftGroup(finalNewGroup);
    } else {
      setAircraftGroup(null);
    }

    // Fetch the aircraft data from the server again to get the updated group
    const updatedAircraftData = await getAircraftById(id);
    setAircraft(updatedAircraftData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewContract({ ...newContract, [name]: value });
  };

  const handleCreateContract = async () => {
    if (!aircraft || hasActiveContract) return;
    const updatedAircraft = await createContract(id, newContract);
    newContract.contractType = "";
    newContract.player = "";
    newContract.destination = "";
    if (typeof updatedAircraft === "number") {
      const errCode = updatedAircraft;
      switch (errCode) {
        default:
          alert(`Failed to create contract: Unknown error (${errCode})`);
          break;
      }
      return;
    }
    setAircraft(updatedAircraft);
    checkForActiveContract(updatedAircraft.contracts);
  };

  const handleLogProfit = async (contractId: string, newProfit: number) => {
    if (!aircraft) return;
    try {
      const updatedAircraft = await logProfit(id, contractId, newProfit);
      setAircraft(updatedAircraft);
      if (updatedAircraft) {
        checkForActiveContract(updatedAircraft.contracts);
      }
    } catch (error: any) {
      alert(`Failed to log profit: ${error.response.data.message}`);
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
      <Breadcrumb>
        <Breadcrumb.Item href="/">Fleet Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item active>
          {aircraft.ac_model} {aircraft.registration}
        </Breadcrumb.Item>
      </Breadcrumb>
      <h1>Aircraft Details</h1>
      <AircraftDetailsListGroup
        aircraft={aircraft}
        customItems={[
          <>
            Group:
            <Form>
              <Form.Select
                name="aircraftGroup"
                value={aircraftGroup?._id || ""}
                style={{ width: "auto" }}
                onChange={handleGroupChange}
              >
                <option value="">None</option>
                {aircraftGroupList.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </Form.Select>
            </Form>
          </>
        ]}
      />

      <h2>Contracts</h2>
      <AircraftContractList
        contracts={aircraft.contracts}
        handleLogProfit={handleLogProfit}
        handleFinishContract={handleFinishContract}
        handleDeleteContract={handleDeleteContract}
      />

      {aircraft.status !== AircraftStatus.Sold && (
        <>
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
                You cannot create a new contract while you have an active
                contract.
              </Alert>
            )}
          </Form>
        </>
      )}
    </Container>
  );
};

export default AircraftDetails;
