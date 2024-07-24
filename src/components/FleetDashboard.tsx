import React, { useEffect, useState } from "react";
import {
  getAircraft,
  createAircraft,
  SortBy,
  SortMode,
  FilterBy
} from "../services/AircraftService";
import { aircraftTypes } from "../AircraftData";
import {
  AircraftSize,
  AircraftStatus,
  AircraftType,
  AirportCode
} from "@mrmagic2020/shared/dist/enums";
import { IAircraft, IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AircraftList from "./AircraftList";
import { getAircraftGroups } from "../services/AircraftGroupService";

const enum LocalStorageKey {
  SortBy = "fleetDashboardSortBy",
  SortMode = "fleetDashboardSortMode",
  FilterBy = "fleetDashboardFilterBy",
  FilterValue = "fleetDashboardFilterValue"
}

const FleetDashboard: React.FC = () => {
  const [sortBy, setSortBy] = useState(
    (localStorage.getItem(LocalStorageKey.SortBy) as SortBy) || SortBy.None
  );
  const [sortMode, setSortMode] = useState(
    localStorage.getItem(LocalStorageKey.SortMode) === "1" ? 1 : 0
  );
  const sortModeRadios = [
    { name: "Ascending", value: SortMode.Ascending },
    { name: "Descending", value: SortMode.Descending }
  ];

  const [filterBy, setFilterBy] = useState(
    (localStorage.getItem(LocalStorageKey.FilterBy) as FilterBy) ||
      FilterBy.None
  );
  const [filterValue, setFilterValue] = useState(
    localStorage.getItem(LocalStorageKey.FilterValue) || FilterBy.None
  );

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

  const fetchAircraftWithSortAndFilter = async () => {
    const data = await getAircraft(sortBy, sortMode, filterBy, filterValue);
    setAircraft(data);
  };

  const fetchAircraftGroups = async () => {
    const data = await getAircraftGroups();
    setAircraftGroups(data);
  };

  useEffect(() => {
    fetchAircraftGroups();
  }, []);

  useEffect(() => {
    fetchAircraftWithSortAndFilter();
  }, [sortBy, sortMode, filterBy, filterValue]);

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
    localStorage.setItem(LocalStorageKey.SortBy, e.target.value);
  };

  const handleSortModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSortMode(parseInt(e.target.value));
    localStorage.setItem(LocalStorageKey.SortMode, e.target.value);
  };

  const handleFilterByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBy(e.target.value as FilterBy);
    localStorage.setItem(LocalStorageKey.FilterBy, e.target.value);
  };

  const handleFilterValueChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFilterValue(e.target.value);
    localStorage.setItem(LocalStorageKey.FilterValue, e.target.value);
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
