import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAircraftGroup,
  updateAircraftGroup,
  getAircraftGroupById
} from "../services/AircraftGroupService";
import { AircraftGroupVisibility } from "@mrmagic2020/shared/dist/enums";
import { IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

const AircraftGroupForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Partial<IAircraftGroup>>({
    name: "",
    description: "",
    colour: "#000000",
    visibility: AircraftGroupVisibility.Public,
    aircrafts: [],
    _id: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchGroup = async () => {
        const data = await getAircraftGroupById(id);
        setGroup(data);
      };
      fetchGroup();
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setGroup({ ...group, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateAircraftGroup(id, group);
        navigate("/aircraftGroups/" + id);
      } else {
        await createAircraftGroup(group);
        navigate("/aircraftGroups");
      }
    } catch (error: any) {
      console.error("Error creating/updating aircraft group:", error);
    }
  };

  return (
    <Container fluid>
      <Form onSubmit={handleSubmit}>
        <h2>{id ? "Edit Aircraft Group" : "Create Aircraft Group"}</h2>
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={group.name}
            onChange={handleInputChange}
            required
            autoComplete="off"
          />
        </Form.Group>
        <Form.Group controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={group.description}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="colour">
          <Form.Label>Colour</Form.Label>
          <Form.Control
            type="color"
            name="colour"
            value={group.colour}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="visibility">
          <Form.Label>Visibility</Form.Label>
          <Form.Select
            name="visibility"
            value={group.visibility}
            onChange={handleInputChange}
            required
          >
            {Object.values(AircraftGroupVisibility).map((visibility) => (
              <option key={visibility} value={visibility}>
                {visibility}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        {group.visibility === AircraftGroupVisibility.Private && (
          <Alert variant="success" className="mt-3">
            This group is private and can only be viewed by you.
          </Alert>
        )}
        {group.visibility === AircraftGroupVisibility.Registered && (
          <Alert variant="warning" className="mt-3">
            This group can be viewed by anyone with a WoA Fleet Tracker account.
          </Alert>
        )}
        {group.visibility === AircraftGroupVisibility.Public && (
          <Alert variant="danger" className="mt-3">
            This group is public and can be viewed by anyone with a link.
          </Alert>
        )}
        <Button variant="outline-primary" type="submit" className="mt-3">
          {id ? "Update" : "Create"}
        </Button>
      </Form>
    </Container>
  );
};

export default AircraftGroupForm;
