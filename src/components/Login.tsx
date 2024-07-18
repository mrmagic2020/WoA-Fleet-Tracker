import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      loginContext();
      navigate("/");
    } catch (err) {
      console.error("Failed to login", err);
      alert("Login failed");
    }
  };

  return (
    <Container fluid>
      <Form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <br />
        <Col xs={3}>
          <FloatingLabel controlId="floatingInput" label="Username">
            <Form.Control
              type="username"
              value={username}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FloatingLabel>
          <br />
          <FloatingLabel controlId="floatingPassword" label="Password">
            <Form.Control
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FloatingLabel>
        </Col>
        <br />
        <Link to="/register">Register</Link>
        <br />
        <Button variant="outline-primary" type="submit">
          Login
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
