import React from "react";
import { UserRole } from "@mrmagic2020/shared/dist/enums";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

const CustomNavbar: React.FC = () => {
  const { isAuthenticated, username, role, logout } = useAuth();
  return (
    <Container fluid>
      <Navbar expand="lg">
        <Navbar.Brand>WoA Fleet Tracker</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav.Link href="/">Dashboard</Nav.Link>
          <Nav className="me-auto">
            {isAuthenticated && role === UserRole.Admin && (
              <Nav.Link href="/admin">Admin</Nav.Link>
            )}
            {isAuthenticated && (
              <NavDropdown title={username} id="user-actions-dropdown">
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
};

export default CustomNavbar;
