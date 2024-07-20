import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login: loginContext } = useAuth();

  if (isAuthenticated) {
    navigate("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const { user } = await login(username, password);
      loginContext(user);
      navigate("/");
    } catch (err: any) {
      console.error("Failed to login", err);
      alert(`Login failed: ${err.response.data.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Container fluid className="login-container">
      <Row className="min-vh-100">
        <Col xs={12} md={6} lg={4}>
          <Form className="login-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
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
            <div className="d-flex justify-content-between align-items-center">
              <Link to="/register">Register</Link>
              <Button
                variant="outline-primary"
                disabled={isLoggingIn}
                type="submit"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
