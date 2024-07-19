import React, { useState } from "react";
import { UserRole } from "@mrmagic2020/shared/dist/enums";
import { useAuth } from "../contexts/AuthContext";
import { updateUsername } from "../services/AuthService";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const CustomNavbar: React.FC = () => {
  const { isAuthenticated, username, role, logout } = useAuth();

  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const handleShowChangeUsername = () => setShowChangeUsername(true);
  const handleCloseChangeUsername = () => setShowChangeUsername(false);

  const [newUsername, setNewUsername] = useState("");
  const handleNewUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  const handleUsernameSumbit = async (e: React.FormEvent) => {
    handleCloseChangeUsername();
    e.preventDefault();
    try {
      await updateUsername(newUsername);
      setNewUsername("");
    } catch (err: any) {
      switch (err.response.status) {
        case 400:
          alert("Username already exists");
          break;
        default:
          alert(`Failed to update username: ${JSON.stringify(err)}`);
          break;
      }
    }
  };

  return (
    <Container fluid>
      <Navbar expand="lg">
        <Navbar.Brand>WoA Fleet Tracker</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Dashboard</Nav.Link>
            {isAuthenticated && role === UserRole.Admin && (
              <Nav.Link href="/admin">Admin</Nav.Link>
            )}
            <Nav.Link href="https://forum.worldofairports.com/" target="_blank">
              WoA
            </Nav.Link>
            <Nav.Link
              href="https://github.com/mrmagic2020/WoA-Fleet-Tracker"
              target="_blank"
            >
              GitHub
            </Nav.Link>
            {isAuthenticated && (
              <>
                <Navbar.Text> | </Navbar.Text>
                <NavDropdown title={username} id="user-actions-dropdown">
                  <NavDropdown.Item onClick={handleShowChangeUsername}>
                    Change Username
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Modal show={showChangeUsername} onHide={handleCloseChangeUsername}>
        <Modal.Header closeButton>
          <Modal.Title>Change Username</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUsernameSumbit}>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>New Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter new username"
                value={newUsername}
                onChange={handleNewUsernameChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleCloseChangeUsername}
          >
            Cancel
          </Button>
          <Button
            variant="outline-primary"
            type="submit"
            onClick={handleUsernameSumbit}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CustomNavbar;
