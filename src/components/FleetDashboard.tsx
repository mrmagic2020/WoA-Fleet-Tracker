import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAircraft,
  createAircraft,
  deleteAircraft,
  SortBy
} from "../services/AircraftService";
import { aircraftTypes } from "../AircraftData";
import { AircraftStatus, AirportCode } from "@mrmagic2020/shared/dist/enums";
import { IAircraft } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Badge from "react-bootstrap/Badge";
import Currency from "./Currency";

const FleetDashboard: React.FC = () => {
  const [sortBy, setSortBy] = useState(SortBy.None);
  const [aircraft, setAircraft] = useState<IAircraft[]>([]);
  const [newAircraft, setNewAircraft] = useState({
    ac_model: "",
    size: "",
    type: "",
    registration: "",
    configuration: { e: 0, b: 0, f: 0, cargo: 0 },
    airport: "",
    status: "Idle",
    totalProfits: 0,
    contracts: []
  });
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<{
    [key: string]: boolean;
  }>({});

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
    setIsCreateLoading(true);
    try {
      console.log(newAircraft);
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
        contracts: []
      });
      setIsCreateLoading(false);
    }
  };

  const handleDeleteAircraft = async (id: string) => {
    setIsDeleteLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteAircraft(id);
      const data = await getAircraft();
      setAircraft(data);
    } catch (error: any) {
      alert(`Failed to delete aircraft: ${error.message}`);
    } finally {
      setIsDeleteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <Container fluid>
      <h1 className="text-center">Fleet Dashboard</h1>
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
            <th>Total Profits</th>
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
              <td>
                <Currency value={aircraft.totalProfits}></Currency>
              </td>
              {aircraft.status === AircraftStatus.InService && (
                <td>
                  <Badge bg="success">{aircraft.status}</Badge>
                </td>
              )}
              {aircraft.status === AircraftStatus.ContractPending && (
                <td>
                  <Badge bg="warning">{aircraft.status}</Badge>
                </td>
              )}
              {aircraft.status === AircraftStatus.Idle && (
                <td>
                  <Badge bg="danger">{aircraft.status}</Badge>
                </td>
              )}
              <td>
                <Link to={`/aircraft/${aircraft._id}`}>
                  <Button variant="outline-info" size="sm">
                    Details
                  </Button>
                </Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => handleDeleteAircraft(aircraft._id)}
                >
                  {isDeleteLoading[aircraft._id] ? "Deleting..." : "Delete"}
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
