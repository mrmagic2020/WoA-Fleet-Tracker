import { IAircraft } from "@mrmagic2020/shared/dist/interfaces";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSharedAircraft } from "../services/AircraftGroupService";
import Alert from "react-bootstrap/Alert";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import AircraftDetailsListGroup from "./AircraftDetailsListGroup";
import AircraftContractList from "./AircraftContractList";

const SharedAircraftDetails: React.FC = () => {
  const { user, groupId, aircraftId } = useParams<{
    user: string;
    groupId: string;
    aircraftId: string;
  }>();
  const fromURL = `/sharedGroups/${user}/${groupId}`;
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [aircraft, setAircraft] = React.useState<IAircraft | null>(null);

  useEffect(() => {
    const fetchAircraft = async () => {
      if (!user || !groupId || !aircraftId) {
        return;
      }
      try {
        const data = await getSharedAircraft(user, groupId, aircraftId);
        setAircraft(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAircraft();
  }, [user, groupId, aircraftId]);

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Alert variant="danger">{error} </Alert>
      </Container>
    );
  }

  if (!aircraft) {
    return null;
  }

  return (
    <Container fluid>
      <Breadcrumb>
        <Breadcrumb.Item href={fromURL}>Back</Breadcrumb.Item>
        <Breadcrumb.Item
          active
        >{`${aircraft.type} ${aircraft.registration}`}</Breadcrumb.Item>
      </Breadcrumb>
      <h1>Aircraft Details</h1>
      <AircraftDetailsListGroup aircraft={aircraft} />
      <AircraftContractList contracts={aircraft.contracts} readonly />
    </Container>
  );
};

export default SharedAircraftDetails;
