import React, { useEffect, useState } from "react";
import { IAircraft, IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import { AircraftStatus } from "@mrmagic2020/shared/dist/enums";
import { Link } from "react-router-dom";
import Currency from "./Currency";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import {
  deleteAircraft,
  getAircraft,
  sellAircraft
} from "../services/AircraftService";
import { getAircraftGroupById } from "../services/AircraftGroupService";

interface AircraftListProps {
  aircrafts: IAircraft[];
  setAircrafts: React.Dispatch<React.SetStateAction<IAircraft[]>>;
  readonly?: boolean;
  inGroup?: boolean;
  shared?: boolean;
}

const AircraftList: React.FC<AircraftListProps> = ({
  aircrafts,
  setAircrafts,
  readonly = false,
  inGroup = false,
  shared = false
}) => {
  const [isSellLoading, setIsSellLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAircraftId, setSelectedAircraftId] = useState("");
  const [groups, setGroups] = useState<{ [key: string]: IAircraftGroup }>({});

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

  return (
    <Container
      fluid
      style={{
        width: "100%",
        whiteSpace: "nowrap",
        overflowX: "auto"
      }}
    >
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
          {aircrafts.map((aircraft, index) => (
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
