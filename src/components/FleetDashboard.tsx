import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAircraft,
  createAircraft,
  deleteAircraft,
  SortBy
} from "../services/AircraftService";
import { aircraftTypes } from "../AircraftData";
import { AirportCode } from "@mrmagic2020/shared/dist/enums";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const FleetDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [sortBy, setSortBy] = useState(SortBy.None);
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [newAircraft, setNewAircraft] = useState({
    ac_model: "",
    size: "",
    type: "",
    registration: "",
    configuration: { e: 0, b: 0, f: 0, cargo: 0 },
    airport: "",
    status: "Idle",
    contracts: []
  });

  useEffect(() => {
    const fetchAircraft = async () => {
      const data = await getAircraft(sortBy);
      setAircraft(data);
    };

    fetchAircraft();
  }, []);

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
    const fetchAircraft = async () => {
      const data = await getAircraft(e.target.value as SortBy);
      setAircraft(data);
    };

    fetchAircraft();
  };

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
    try {
      await createAircraft(newAircraft);
      const data = await getAircraft();
      setAircraft(data);
    } catch (error: any) {
      if (error.message === "Aircraft already exists") {
        alert("Failed to create aircraft: Aircraft already exists");
      } else {
        alert(`Failed to create aircraft: ${error.message}`);
      }
    }
  };

  const handleDeleteAircraft = async (id: string) => {
    await deleteAircraft(id);
    const data = await getAircraft();
    setAircraft(data);
  };

  return (
    <Container fluid>
      <h1 className="text-center">Fleet Dashboard</h1>
      <div className="text-center">
        <Button variant="outline-primary" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
      <br />
      <Form>
        <Row>
          <Col xs="auto">
            <Form.Label>Sort by</Form.Label>
          </Col>
          <Col xs="auto">
            <Form.Select
              size="sm"
              name="sortBy"
              value={sortBy}
              onChange={handleSortByChange}
            >
              {Object.values(SortBy).map((sort) => (
                <option key={sort} value={sort}>
                  {sort}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Form>
      <Table striped hover>
        <thead>
          <tr>
            <th>Model</th>
            <th>Size</th>
            <th>Type</th>
            <th>Registration</th>
            <th>Airport</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {aircraft.map((aircraft, index) => (
            <tr key={index}>
              <td>{aircraft.ac_model}</td>
              <td>{aircraft.size}</td>
              <td>{aircraft.type}</td>
              <td>{aircraft.registration}</td>
              <td>{aircraft.airport}</td>
              <td>
                {aircraft.contracts[aircraft.contracts.length - 1]?.destination}
              </td>
              <td>{aircraft.status}</td>
              <td>
                <Link to={`/aircraft/${aircraft._id}`}>
                  <Button variant="outline-info" size="sm">
                    Details
                  </Button>
                </Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteAircraft(aircraft._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
          <Col>
            <Button
              variant="outline-primary"
              type="submit"
              disabled={
                !newAircraft.ac_model ||
                !newAircraft.registration ||
                !newAircraft.airport
              }
            >
              Create
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default FleetDashboard;
