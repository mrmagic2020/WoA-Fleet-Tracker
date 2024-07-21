import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParams, useLocation } from "react-router-dom";
import { getSharedAircraftGroup } from "../services/AircraftGroupService";
import { IAircraft, IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import AircraftList from "./AircraftList";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";

const SharedAircraftGroup: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { user, groupId } = useParams<{ user: string; groupId: string }>();
  const [group, setGroup] = useState<IAircraftGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterLink, setShowRegisterLink] = useState<boolean>(false);
  const [aircrafts, setAircrafts] = useState<IAircraft[]>([]);

  if (!isAuthenticated) {
    sessionStorage.setItem("redirectAfterAuth", location.pathname);
  }

  useEffect(() => {
    const fetchGroup = async () => {
      if (!user || !groupId) {
        return;
      }
      try {
        const data = await getSharedAircraftGroup(user, groupId);
        if (!data) {
          setError("Group not found");
          return;
        }
        setGroup(data);
        setAircrafts(data.aircrafts as any as IAircraft[]);
      } catch (err: any) {
        setError(err.response?.data?.message || "An error occurred");
        if (err.response?.status === 401) {
          setShowRegisterLink(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [user, groupId]);

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
        <Alert variant="danger">
          {error} {showRegisterLink && <a href="/register">Register Now</a>}{" "}
        </Alert>
      </Container>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <Container fluid>
      <h1>
        {group.name} <Badge bg="info">{user}</Badge>
      </h1>
      <p>{group.description}</p>
      <AircraftList
        aircrafts={aircrafts}
        setAircrafts={() => {}}
        readonly
        noDetails
        shared
      />
    </Container>
  );
};

export default SharedAircraftGroup;
