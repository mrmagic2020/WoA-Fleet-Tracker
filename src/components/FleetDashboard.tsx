import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAircraft,
  createAircraft,
  deleteAircraft,
  SortBy,
  SortMode,
  FilterBy,
  sellAircraft
} from "../services/AircraftService";
import { aircraftTypes } from "../AircraftData";
import {
  AircraftSize,
  AircraftStatus,
  AircraftType,
  AirportCode
} from "@mrmagic2020/shared/dist/enums";
import { IAircraft } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Badge from "react-bootstrap/Badge";
import Currency from "./Currency";
import Modal from "react-bootstrap/Modal";

const FleetDashboard: React.FC = () => {
  const [sortBy, setSortBy] = useState(SortBy.None);
  const [sortMode, setSortMode] = useState(SortMode.Ascending);
  const sortModeRadios = [
    { name: "Ascending", value: SortMode.Ascending },
    { name: "Descending", value: SortMode.Descending }
  ];

  const [filterBy, setFilterBy] = useState(FilterBy.None);
  const [filterValue, setFilterValue] = useState("");

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
  const [isSellLoading, setIsSellLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAircraftId, setSelectedAircraftId] = useState("");

  const fetchAircraftWithSortAndFilter = async () => {
    const data = await getAircraft(sortBy, sortMode, filterBy, filterValue);
    setAircraft(data);
  };

  useEffect(() => {
    fetchAircraftWithSortAndFilter();
  }, [sortBy, sortMode, filterBy, filterValue]);

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
  };

  const handleSortModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSortMode(parseInt(e.target.value));
  };

  const handleFilterByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBy(e.target.value as FilterBy);
  };

  const handleFilterValueChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFilterValue(e.target.value);
    fetchAircraftWithSortAndFilter();
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

  const handleSellAircraft = async (id: string) => {
    setIsSellLoading(true);
    try {
      await sellAircraft(id);
      const data = await getAircraft();
      setAircraft(data);
    } catch (error: any) {
      alert(`Failed to sell aircraft: ${error.message}`);
    } finally {
      setIsSellLoading(false);
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
            <Form.Label htmlFor="sortBy">Sort by</Form.Label>
          </Col>
          <Col xs="auto">
            <Form.Select
              size="sm"
              id="sortBy"
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
          <Col xs="auto">
            <ButtonGroup>
              {sortModeRadios.map((radio) => (
                <ToggleButton
                  key={radio.value}
                  id={`sortMode-${radio.value}`}
                  type="radio"
                  variant="outline-secondary"
                  size="sm"
                  name="sortMode"
                  value={radio.value}
                  checked={sortMode === radio.value}
                  onChange={handleSortModeChange}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Col>
        </Row>
        <Row>
          <Col xs="auto">
            <Form.Label htmlFor="filterBy">Filter by</Form.Label>
          </Col>
          <Col xs="auto">
            <Form.Select
              size="sm"
              id="filterBy"
              value={filterBy}
              onChange={handleFilterByChange}
            >
              {Object.values(FilterBy).map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto">
            {filterBy === FilterBy.Model && (
              <Form.Select
                size="sm"
                value={filterValue}
                onChange={handleFilterValueChange}
              >
                <option value="" disabled>
                  Select Model
                </option>
                {aircraftTypes.map((type) => (
                  <option key={type.Aircraft} value={type.Aircraft}>
                    {type.Aircraft}
                  </option>
                ))}
              </Form.Select>
            )}
            {filterBy === FilterBy.Size && (
              <Form.Select
                size="sm"
                value={filterValue}
                onChange={handleFilterValueChange}
              >
                <option value="" disabled>
                  Select Size
                </option>
                {Object.values(AircraftSize).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Form.Select>
            )}
            {filterBy === FilterBy.Type && (
              <Form.Select
                size="sm"
                value={filterValue}
                onChange={handleFilterValueChange}
              >
                <option value="" disabled>
                  Select Type
                </option>
                {Object.values(AircraftType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            )}
            {filterBy === FilterBy.Airport && (
              <Form.Select
                size="sm"
                value={filterValue}
                onChange={handleFilterValueChange}
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
            )}
            {(filterBy === FilterBy.Destination ||
              filterBy === FilterBy.Registration) && (
              <Form.Control
                size="sm"
                type="text"
                value={filterValue}
                onChange={handleFilterValueChange}
                placeholder="Search..."
              />
            )}
            {filterBy === FilterBy.Status && (
              <Form.Select
                size="sm"
                value={filterValue}
                onChange={handleFilterValueChange}
              >
                <option value="" disabled>
                  Select Status
                </option>
                {Object.values(AircraftStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            )}
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
              {aircraft.status === AircraftStatus.Idle && (
                <td>
                  <Badge bg="danger">{aircraft.status}</Badge>
                </td>
              )}
              {aircraft.status === AircraftStatus.Sold && (
                <td>
                  <Badge bg="secondary">{aircraft.status}</Badge>
                </td>
              )}
              <td>
                <Link to={`/aircraft/${aircraft._id}`}>
                  <Button
                    variant="outline-info"
                    size="sm"
                    style={{ width: "4rem" }}
                  >
                    Details
                  </Button>
                </Link>
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="ms-2"
                  style={{ width: "4rem" }}
                  disabled={aircraft.status === AircraftStatus.Sold}
                  onClick={() => {
                    setSelectedAircraftId(aircraft._id);
                    setShowSellModal(true);
                  }}
                >
                  {aircraft.status === AircraftStatus.Sold ? "Sold" : "Sell"}
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-2"
                  style={{ width: "4rem" }}
                  onClick={() => {
                    setSelectedAircraftId(aircraft._id);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Aircraft</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this aircraft?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outline-danger"
            disabled={isDeleteLoading[selectedAircraftId]}
            onClick={() => {
              handleDeleteAircraft(selectedAircraftId);
              setShowDeleteModal(false);
            }}
          >
            {isDeleteLoading[selectedAircraftId] ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSellModal} onHide={() => setShowSellModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sell Aircraft</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to sell and archive this aircraft? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowSellModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outline-warning"
            disabled={isSellLoading}
            onClick={() => {
              handleSellAircraft(selectedAircraftId);
              setShowSellModal(false);
            }}
          >
            {isSellLoading ? "Selling..." : "Sell"}
          </Button>
        </Modal.Footer>
      </Modal>

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
