import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getAircraftGroups,
  deleteAircraftGroup
} from "../services/AircraftGroupService";
import { IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import ShareGroupModal from "./ShareGroupModal";

const AircraftGroupList: React.FC = () => {
  const { username } = useAuth();
  const [groups, setGroups] = useState<IAircraftGroup[]>([]);
  const [sharingGroup, setSharingGroup] = useState<IAircraftGroup | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const fetchGroups = async () => {
    const data = await getAircraftGroups();
    setGroups(data);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleShareGroup = async (group: IAircraftGroup) => {
    setShowShareModal(true);
    setSharingGroup(group);
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteAircraftGroup(id);
    fetchGroups();
    setShowDeleteModal(false);
  };

  return (
    <Container fluid>
      <h1 className="text-center">Aircraft Groups</h1>
      <Link to="/aircraftGroups/new">
        <Button variant="outline-primary">Create New Group</Button>
      </Link>
      <Table striped hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Colour</th>
            <th>Visibility</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, index) => (
            <tr key={index}>
              <td>{group.name}</td>
              <td>{group.description}</td>
              <td style={{ backgroundColor: group.colour }}>{group.colour}</td>
              <td>{group.visibility}</td>
              <td>
                <Link to={`/aircraftGroups/${group._id}`}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    style={{ width: "4rem" }}
                  >
                    Details
                  </Button>
                </Link>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="ms-2"
                  style={{ width: "4rem" }}
                  onClick={() => handleShareGroup(group)}
                >
                  Share
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-2"
                  style={{ width: "4rem" }}
                  onClick={() => {
                    setSelectedGroupId(group._id);
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

      <ShareGroupModal
        show={showShareModal}
        setShow={setShowShareModal}
        username={username}
        groupName={sharingGroup?.name || ""}
        groupID={sharingGroup?._id || ""}
      />

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Aircraft Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this aircraft group?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => handleDeleteGroup(selectedGroupId)}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AircraftGroupList;
