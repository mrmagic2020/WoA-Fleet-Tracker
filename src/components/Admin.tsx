import React, { useEffect, useState } from "react";
import {
  getUsers,
  createInvitation,
  getAllInvitations,
  deleteInvitation
} from "../services/AdminService";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "@mrmagic2020/shared/dist/enums";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

const UserList: React.FC = () => {
  const role = useAuth().role;
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState<
    { code: string; remainingUses: number }[]
  >([]);
  const [newInvitation, setNewInvitation] = useState({
    code: "",
    remainingUses: NaN
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    const fetchInvitations = async () => {
      try {
        const invitations = await getAllInvitations();
        setInvitations(invitations);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      }
    };

    fetchUsers();
    fetchInvitations();
  }, []);

  const handleInvitationInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewInvitation({ ...newInvitation, [name]: value });
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvitation(newInvitation.code, newInvitation.remainingUses);
      setNewInvitation({ code: "", remainingUses: NaN });
      const invitations = await getAllInvitations();
      setInvitations(invitations);
    } catch (error: any) {
      console.error("Failed to create invitation:", error);
      alert(`Failed to create invitation: ${error.response.data.message}`);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      await deleteInvitation(id);
      const invitations = await getAllInvitations();
      setInvitations(invitations);
    } catch (error) {
      console.error("Failed to delete invitation:", error);
    }
  };

  if (role !== UserRole.Admin) {
    return (
      <Container fluid>You are not authorized to view this page</Container>
    );
  }
  return (
    <Container fluid>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Admin</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Invitations</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Invitation Code</th>
            <th>Remaining Uses</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invitation: any) => (
            <tr key={invitation._id}>
              <td>{invitation.code}</td>
              <td>{invitation.remainingUses}</td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteInvitation(invitation._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Form onSubmit={handleCreateInvitation}>
        <Form.Group as={Col} xs={2}>
          <Form.Label>Invitation Code</Form.Label>
          <Form.Control
            type="text"
            name="code"
            value={newInvitation.code}
            onChange={handleInvitationInputChange}
            required
          />
        </Form.Group>
        <Form.Group as={Col} xs={2}>
          <Form.Label>Remaining Uses</Form.Label>
          <Form.Control
            type="number"
            name="remainingUses"
            value={newInvitation.remainingUses || ""}
            onChange={handleInvitationInputChange}
            required
          />
        </Form.Group>
        <br />
        <Button variant="outline-primary" type="submit">
          Create Invitation
        </Button>
      </Form>

      <h2>Registered Users</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <Button variant="outline-danger" size="sm">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default UserList;
