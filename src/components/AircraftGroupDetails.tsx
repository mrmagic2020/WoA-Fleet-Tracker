import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAircraftById } from "../services/AircraftService";
import { getAircraftGroupById } from "../services/AircraftGroupService";
import { AircraftGroupVisibility } from "@mrmagic2020/shared/dist/enums";
import { IAircraftGroup, IAircraft } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import AircraftList from "./AircraftList";
import ShareGroupModal from "./ShareGroupModal";
import LoadingFallback from "./LoadingFallback";

const AircraftGroupDetails: React.FC = () => {
  const { username } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<IAircraftGroup | null>(null);
  const [aircrafts, setAircrafts] = useState<IAircraft[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

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
    return <LoadingFallback />;
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
      <Button
        variant="outline-info"
        className="ms-3"
        onClick={() => setShowShareModal(true)}
      >
        Share Group
      </Button>
      <h2 className="mt-3">Aircrafts</h2>
      <AircraftList
        aircrafts={aircrafts}
        setAircrafts={setAircrafts}
        readonly
        inGroup
      />

      <ShareGroupModal
        show={showShareModal}
        setShow={setShowShareModal}
        username={username}
        groupName={group.name}
        groupID={group._id}
      />
    </Container>
  );
};

export default AircraftGroupDetails;
