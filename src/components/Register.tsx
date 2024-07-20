import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login: loginContext } = useAuth();

  if (isAuthenticated) {
    navigate("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const { token, user } = await register(
        username,
        password,
        invitationCode
      );
      localStorage.setItem("token", token);
      loginContext(user);
      navigate("/");
    } catch (err: any) {
      console.error("Failed to register", err);
      alert(`Registration failed: ${err.response.data.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Container fluid>
      <Row className="min-vh-100">
        <Col xs={12} md={6} lg={4}>
          <Form className="p-4 border rounded shadow" onSubmit={handleSubmit}>
            <h2>Register</h2>
            <br />
            <FloatingLabel
              controlId="floatingInput"
              label="Username"
              className="mb-3"
            >
              <Form.Control
                type="username"
                value={username}
                placeholder="Username"
                autoComplete="off"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="floatingPassword"
              label="Password"
              className="mb-3"
            >
              <Form.Control
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="floatingInvitationCode"
              label="Invitation Code"
              className="mb-3"
            >
              <Form.Control
                type="invitationCode"
                value={invitationCode}
                placeholder="Invitation Code"
                autoComplete="off"
                onChange={(e) => setInvitationCode(e.target.value)}
              />
            </FloatingLabel>
            <div className="d-flex justify-content-between align-items-center">
              <Link to="/login">Login</Link>
              <Button
                variant="outline-primary"
                disabled={isRegistering}
                type="submit"
              >
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
