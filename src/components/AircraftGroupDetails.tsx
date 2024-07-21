import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAircraftById } from "../services/AircraftService";
import { getAircraftGroupById } from "../services/AircraftGroupService";
import { AircraftGroupVisibility } from "@mrmagic2020/shared/dist/enums";
import { IAircraftGroup, IAircraft } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import AircraftList from "./AircraftList";

const AircraftGroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<IAircraftGroup | null>(null);
  const [aircrafts, setAircrafts] = useState<IAircraft[]>([]);

  useEffect(() => {
    const fetchGroup = async () => {
      const data = await getAircraftGroupById(id!);
      setGroup(data);
      const aircraftPromises = data.aircrafts.map((aircraftId) =>
        getAircraftById(aircraftId as any)
      );
      const aircraftsData = await Promise.all(aircraftPromises);
      setAircrafts(aircraftsData);
    };
    fetchGroup();
  }, [id]);

  if (!group) {
    return (
      <Container fluid>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h1>
        {group.name}{" "}
        {group.visibility === AircraftGroupVisibility.Public && (
          <Badge pill bg="primary">
            {group.visibility}
          </Badge>
        )}
        {group.visibility === AircraftGroupVisibility.Registered && (
          <Badge pill bg="warning">
            {group.visibility}
          </Badge>
        )}
        {group.visibility === AircraftGroupVisibility.Private && (
          <Badge pill bg="secondary">
            {group.visibility}
          </Badge>
        )}
      </h1>
      <p>{group.description}</p>
      <p>
        Colour:{" "}
        <span style={{ backgroundColor: group.colour }}>{group.colour}</span>
      </p>
      <Link to={`/aircraftGroups/edit/${group._id}`}>
        <Button variant="outline-primary">Edit Group</Button>
      </Link>
      <AircraftList
        aircrafts={aircrafts}
        setAircrafts={setAircrafts}
        readonly
      />
    </Container>
  );
};

export default AircraftGroupDetails;
