import React, { useEffect, useState } from "react";
import { getAircraft, createAircraft } from "../services/AircraftService";
import { aircraftTypes } from "../AircraftData";
import { AirportCode } from "@mrmagic2020/shared/dist/enums";
import { IAircraft, IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AircraftList from "./AircraftList";
import { getAircraftGroups } from "../services/AircraftGroupService";

const FleetDashboard: React.FC = () => {
  const [aircraft, setAircraft] = useState<IAircraft[]>([]);
  const [aircraftGroups, setAircraftGroups] = useState<IAircraftGroup[]>([]);
  const [newAircraft, setNewAircraft] = useState({
    ac_model: "",
    size: "",
    type: "",
    registration: "",
    configuration: { e: 0, b: 0, f: 0, cargo: 0 },
    airport: "",
    status: "Idle",
    totalProfits: 0,
    contracts: [],
    aircraftGroup: "" as string | null
  });

  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const fetchAircraftGroups = async () => {
    const data = await getAircraftGroups();
    setAircraftGroups(data);
  };

  useEffect(() => {
    fetchAircraftGroups();
  }, []);

  const handleAircraftInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewAircraft({ ...newAircraft, [name]: value });
  };

  const handleAircraftTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedAircraftType = aircraftTypes.find(
      (a) => a.Aircraft === e.target.value
    );
    if (selectedAircraftType) {
      setNewAircraft({
        ...newAircraft,
        ac_model: selectedAircraftType.Aircraft,
        size: selectedAircraftType.Size,
        type: selectedAircraftType.Type
        // Other fields remain the same
      });
    }
  };

  const handleCreateAircraft = async () => {
    setIsCreateLoading(true);
    try {
      if (newAircraft.aircraftGroup === "") {
        newAircraft.aircraftGroup = null;
      }
      await createAircraft(newAircraft);
      const data = await getAircraft();
      setAircraft(data);
    } catch (error: any) {
      if (error.message === "Aircraft already exists") {
        alert("Failed to create aircraft: Aircraft already exists");
      } else {
        alert(`Failed to create aircraft: ${error.message}`);
      }
    } finally {
      setNewAircraft({
        ac_model: "",
        size: "",
        type: "",
        registration: "",
        configuration: { e: 0, b: 0, f: 0, cargo: 0 },
        airport: "",
        status: "Idle",
        totalProfits: 0,
        contracts: [],
        aircraftGroup: ""
      });
      setIsCreateLoading(false);
    }
  };

  return (
    <Container fluid>
      <h1 className="text-center mb-4">Fleet Dashboard</h1>

      <AircraftList aircrafts={aircraft} setAircrafts={setAircraft} />

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateAircraft();
        }}
      >
        <Row>
          <Col xs="auto">
            <Form.Select
              name="ac_model"
              value={newAircraft.ac_model}
              onChange={handleAircraftTypeChange}
              required
            >
              <option value="" disabled>
                Select Aircraft
              </option>
              {aircraftTypes.map((type) => (
                <option key={type.Aircraft} value={type.Aircraft}>
                  {type.Aircraft}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="1">
            <Form.Control plaintext readOnly defaultValue={newAircraft.size} />
          </Col>
          <Col xs="1">
            <Form.Control plaintext readOnly defaultValue={newAircraft.type} />
          </Col>
          <Col xs="auto">
            <Form.Control
              type="text"
              name="registration"
              value={newAircraft.registration}
              onChange={handleAircraftInputChange}
              placeholder="Registration"
              autoComplete="off"
              required
            />
          </Col>
          <Col xs="auto">
            <Form.Select
              name="airport"
              value={newAircraft.airport}
              onChange={handleAircraftInputChange}
              required
            >
              <option value="" disabled>
                Select Airport
              </option>
              {Object.values(AirportCode).map((airport) => (
                <option key={airport} value={airport}>
                  {airport}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto">
            <Form.Select
              name="aircraftGroup"
              value={newAircraft.aircraftGroup ?? ""}
              onChange={handleAircraftInputChange}
            >
              <option value={""}>None</option>
              {aircraftGroups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Button
              variant="outline-primary"
              type="submit"
              disabled={
                !newAircraft.ac_model ||
                !newAircraft.registration ||
                !newAircraft.airport ||
                isCreateLoading
              }
            >
              {isCreateLoading ? "Creating..." : "Create"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default FleetDashboard;
