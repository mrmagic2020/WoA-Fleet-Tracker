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
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import usernameSchema from "../YupSharedSchema/username";

const userMetaSchema = Yup.object().shape({
  username: usernameSchema
});

interface UserMetaFormValues extends Yup.InferType<typeof userMetaSchema> {}

const CustomNavbar: React.FC = () => {
  const { isAuthenticated, username, role, logout } = useAuth();

  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const handleShowChangeUsername = () => setShowChangeUsername(true);
  const handleCloseChangeUsername = () => setShowChangeUsername(false);

  const handleUsernameSubmit = async (values: UserMetaFormValues) => {
    handleCloseChangeUsername();
    try {
      await updateUsername(values.username);
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
            {isAuthenticated && <Nav.Link href="/">Fleet</Nav.Link>}
            {isAuthenticated && (
              <Nav.Link href="/aircraftGroups">Groups</Nav.Link>
            )}
            {isAuthenticated && role === UserRole.Admin && (
              <Nav.Link href="/admin">Admin</Nav.Link>
            )}
            <Nav.Link href="https://forum.worldofairports.com/" target="_blank">
              WoA
            </Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            {isAuthenticated ? (
              <NavDropdown
                title={username}
                id="user-actions-dropdown"
                className="ms-3"
              >
                <NavDropdown.Item onClick={handleShowChangeUsername}>
                  Change Username
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown title="Login" id="account-dropdown" className="ms-3">
                <NavDropdown.Item href="/login">Login</NavDropdown.Item>
                <NavDropdown.Item href="/register">Register</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Modal show={showChangeUsername} onHide={handleCloseChangeUsername}>
        <Modal.Header closeButton>
          <Modal.Title>Change Username</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ username: "" }}
            validationSchema={userMetaSchema}
            onSubmit={handleUsernameSubmit}
          >
            {({ handleSubmit, isSubmitting, touched, errors }) => (
              <FormikForm noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label>New Username</Form.Label>
                  <Field
                    type="text"
                    name="username"
                    placeholder="Enter new username"
                    className={`form-control ${
                      touched.username && errors.username ? "is-invalid" : ""
                    }`}
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="invalid-feedback"
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="outline-secondary"
                    onClick={handleCloseChangeUsername}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline-primary"
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                  >
                    Save
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CustomNavbar;
