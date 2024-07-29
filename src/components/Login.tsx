import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";
import { getRandomBackgroundImage } from "../assets/BackgroundImage";
import ImageCredit from "./ImageCredit";
import Container from "react-bootstrap/Container";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../styles/Login.css";

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required")
});

interface LoginFormValues extends Yup.InferType<typeof LoginSchema> {}

const Login: React.FC = () => {
  const [backgroundImage] = useState(getRandomBackgroundImage());

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login: loginContext } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(sessionStorage.getItem("redirectAfterAuth") || "/");
      sessionStorage.removeItem("redirectAfterAuth");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    document.title = "WoA Fleet Tracker - Login";
  }, []);

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true);
    try {
      const { user } = await login(values.username, values.password);
      loginContext(user);
      const redirectTo = sessionStorage.getItem("redirectAfterAuth") || "/";
      sessionStorage.removeItem("redirectAfterAuth");
      navigate(redirectTo);
    } catch (err: any) {
      console.error("Failed to login", err);
      alert(`Login failed: ${err.response.data.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Container
      fluid
      className="login-container"
      style={{
        backgroundImage: `url(${backgroundImage.path})`
      }}
    >
      <Row className="min-vh-100">
        <Col xs={12} md={6} lg={4}>
          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, touched, errors }) => (
              <FormikForm
                noValidate
                className="login-form"
                onSubmit={handleSubmit}
              >
                <h2>Login</h2>
                <br />
                <FloatingLabel
                  controlId="floatingInput"
                  label="Username"
                  className="mb-3"
                >
                  <Field
                    name="username"
                    type="text"
                    placeholder="Username"
                    className={`form-control ${
                      touched.username && errors.username ? "is-invalid" : ""
                    }`}
                    required
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="invalid-feedback"
                  />
                </FloatingLabel>
                <FloatingLabel
                  controlId="floatingPassword"
                  label="Password"
                  className="mb-3"
                >
                  <Field
                    name="password"
                    type="password"
                    placeholder="Password"
                    className={`form-control ${
                      touched.password && errors.password ? "is-invalid" : ""
                    }`}
                    required
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="invalid-feedback"
                  />
                </FloatingLabel>
                <div className="d-flex justify-content-between align-items-center">
                  <Link to="/register">Register</Link>
                  <Button
                    variant="outline-primary"
                    disabled={isLoggingIn || Object.keys(errors).length > 0}
                    type="submit"
                  >
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <ImageCredit {...backgroundImage} />
              </FormikForm>
            )}
          </Formik>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
