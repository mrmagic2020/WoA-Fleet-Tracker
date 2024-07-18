import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, password);
      loginContext();
      navigate('/');
    } catch (err: any) {
      console.error('Failed to register', err);
      let message = "Unknown error";
      if (err.response.status === 400) {
        message = "User already exists";
      }
      alert(`Registration failed: ${message}`);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <br/>
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
        <br/>
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
      <br/>
      <Link to="/login">Login</Link>
      <br />
      <Button variant="outline-primary" type="submit">
        Register
      </Button>
    </Form>
  );
};

export default Register;