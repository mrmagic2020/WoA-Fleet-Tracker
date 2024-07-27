import React, { useEffect, useState } from "react";
import { IAircraft, IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import {
  AircraftSize,
  AircraftStatus,
  AircraftType,
  AirportCode
} from "@mrmagic2020/shared/dist/enums";
import {
  deleteAircraft,
  FilterBy,
  getAircraft,
  getAircraftsByGroup,
  sellAircraft,
  SortBy,
  SortMode
} from "../services/AircraftService";
import { getAircraftGroupById } from "../services/AircraftGroupService";
import { aircraftTypes } from "../AircraftData";
import { Link } from "react-router-dom";
import Currency from "./Currency";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Pagination from "react-bootstrap/Pagination";
import LoadingFallback from "./LoadingFallback";

const enum LocalStorageKey {
  SortBy = "fleetDashboardSortBy",
  SortMode = "fleetDashboardSortMode",
  FilterBy = "fleetDashboardFilterBy",
  FilterValue = "fleetDashboardFilterValue"
}

interface AircraftListProps {
  aircrafts: IAircraft[];
  setAircrafts: React.Dispatch<React.SetStateAction<IAircraft[]>>;
  readonly?: boolean;
  inGroup?: boolean;
  groupId?: string;
  shared?: boolean;
}

const AircraftList: React.FC<AircraftListProps> = ({
  aircrafts,
  setAircrafts,
  readonly = false,
  inGroup = false,
  groupId,
  shared = false
}) => {
  if (inGroup && !groupId) {
    throw new Error("groupId is required when inGroup is true");
  }

  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const [isSellLoading, setIsSellLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAircraftId, setSelectedAircraftId] = useState("");
  const [groups, setGroups] = useState<{ [key: string]: IAircraftGroup }>({});

  const fetchAircraftWithSortAndFilter = async () => {
    const data = inGroup
      ? await getAircraftsByGroup(
          groupId!,
          sortBy,
          sortMode,
          filterBy,
          filterValue
        )
      : await getAircraft(sortBy, sortMode, filterBy, filterValue);
    setAircrafts(data);
  };

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

  useEffect(() => {
    if (shared || inGroup) {
      return;
    }
    const fetchGroups = async () => {
      try {
        const groupPromises = aircrafts.map(async (aircraft) => {
          if (
            aircraft.aircraftGroup &&
            !groups[aircraft.aircraftGroup as any]
          ) {
            const group = await getAircraftGroupById(
              aircraft.aircraftGroup as any
            );
            return { [aircraft.aircraftGroup as any]: group };
          }
          return null;
        });
        const groupResults = await Promise.all(groupPromises);
        const newGroups = groupResults
          .filter((group) => group !== null)
          .reduce((acc, group) => ({ ...acc, ...group }), {});

        setGroups((prevGroups) => ({ ...prevGroups, ...newGroups }));
      } catch (error: any) {
        alert(`Failed to fetch groups: ${error.message}`);
      }
    };

    fetchGroups();
  }, [aircrafts]);

  const handleSellAircraft = async (id: string) => {
    setIsSellLoading(true);
    try {
      await sellAircraft(id);
      const data = await getAircraft();
      setAircrafts(data);
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
      setAircrafts(data);
    } catch (error: any) {
      alert(`Failed to delete aircraft: ${error.message}`);
    } finally {
      setIsDeleteLoading((prev) => ({ ...prev, [id]: false }));
      setShowDeleteModal(false);
    }
  };

  if (!aircrafts) {
    return <LoadingFallback />;
  }

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAircrafts = aircrafts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(aircrafts.length / itemsPerPage);

  return (
    <Container
      fluid
      style={{
        width: "100%",
        whiteSpace: "nowrap",
        overflowX: "auto"
      }}
    >
      <Form>
        <Row>
          <Col xs="auto" className="d-flex align-items-center">
            <Form.Label htmlFor="sortBy" className="mb-0">
              Sort by
            </Form.Label>
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
          <Col xs="auto" className="d-flex align-items-center">
            <Form.Label htmlFor="filterBy" className="mb-0">
              Filter by
            </Form.Label>
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
          <Col xs="auto" className="d-flex align-items-center ms-auto">
            <Form.Label htmlFor="itemsPerPage" className="me-2 mb-0">
              Items per page
            </Form.Label>
            <Form.Select
              size="sm"
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
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
            <th>Current Mean Profit</th>
            <th>Total Profits</th>
            <th>Status</th>
            {!inGroup && <th>Group</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentAircrafts.map((aircraft, index) => (
            <tr key={index}>
              <td>{aircraft.ac_model}</td>
              <td>{aircraft.size}</td>
              <td>{aircraft.type}</td>
              <td>{aircraft.registration}</td>
              <td>{aircraft.airport}</td>
              <td>{aircraft.contracts[0]?.destination}</td>
              <td>
                <Currency
                  value={
                    aircraft.contracts[0]?.profits.reduce((a, b) => a + b, 0) /
                    aircraft.contracts[0]?.profits.length
                  }
                ></Currency>
              </td>
              <td>
                <Currency value={aircraft.totalProfits} decimals={0}></Currency>
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
              {!inGroup && (
                <td>
                  {!shared && (
                    <>
                      {aircraft.aircraftGroup &&
                      !groups[aircraft.aircraftGroup as any] ? (
                        <Spinner animation="border" size="sm" />
                      ) : aircraft.aircraftGroup &&
                        groups[aircraft.aircraftGroup as any] ? (
                        <Link
                          to={`/aircraftGroups/${aircraft.aircraftGroup}`}
                          style={{
                            color: groups[aircraft.aircraftGroup as any].colour
                          }}
                        >
                          {groups[aircraft.aircraftGroup as any].name}
                        </Link>
                      ) : (
                        "None"
                      )}
                    </>
                  )}
                </td>
              )}
              <td>
                <Link
                  to={
                    shared
                      ? `${window.location.href}/${aircraft._id}`
                      : `/aircraft/${aircraft._id}`
                  }
                >
                  <Button
                    variant="outline-info"
                    size="sm"
                    style={{ width: "4rem" }}
                  >
                    Details
                  </Button>
                </Link>
                {!readonly && (
                  <>
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
                      {aircraft.status === AircraftStatus.Sold
                        ? "Sold"
                        : "Sell"}
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
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Container className="d-flex justify-content-center">
        <Pagination>
          <Pagination.First
            onClick={() => setActivePage(1)}
            disabled={activePage === 1}
          />
          <Pagination.Prev
            onClick={() => setActivePage((prev) => prev - 1)}
            disabled={activePage === 1}
          />
          {Array.from({ length: totalPages }).map((_, index) => (
            <Pagination.Item
              key={index}
              active={index + 1 === activePage}
              onClick={() => setActivePage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setActivePage((prev) => prev + 1)}
            disabled={activePage === totalPages}
          />
          <Pagination.Last
            onClick={() => setActivePage(totalPages)}
            disabled={activePage === totalPages}
          />
        </Pagination>
      </Container>

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
        <Modal.Body>
          Are you sure you want to sell and archive this aircraft? This action
          cannot be undone.
        </Modal.Body>
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
    </Container>
  );
};

export default AircraftList;
