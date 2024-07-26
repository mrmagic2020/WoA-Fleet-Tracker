import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { verifyReCAPTCHA } from "../services/ReCAPTCHAService";
import { useNavigate } from "react-router-dom";
import { register } from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import { Limits } from "@mrmagic2020/shared/dist/constants";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../styles/Register.css";

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(
      Limits.MinUsernameLength,
      `Username must be at least ${Limits.MinUsernameLength} characters`
    )
    .max(
      Limits.MaxUsernameLength,
      `Username must be at most ${Limits.MaxUsernameLength} characters`
    )
    .required("Username is required"),
  password: Yup.string()
    .min(
      Limits.MinPasswordLength,
      `Password must be at least ${Limits.MinPasswordLength} characters`
    )
    .max(
      Limits.MaxPasswordLength,
      `Password must be at most ${Limits.MaxPasswordLength} characters`
    )
    .test({
      name: "password",
      skipAbsent: true,
      test: (value, ctx) => {
        if (!value) {
          return false;
        }
        const hasLetter = /[a-zA-Z]/.test(value);
        if (!hasLetter) {
          return ctx.createError({ message: "Password must contain a letter" });
        }
        const hasNumber = /\d/.test(value);
        if (!hasNumber) {
          return ctx.createError({ message: "Password must contain a number" });
        }
        return true;
      }
    })
    .required("Password is required"),
  invitationCode: Yup.string()
});

interface RegisterFormValues extends Yup.InferType<typeof RegisterSchema> {}

const Register: React.FC = () => {
  const recaptchaRef = React.createRef<ReCAPTCHA>();
  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  const recaptchaAction = "Register";

  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login: loginContext } = useAuth();

  if (isAuthenticated) {
    navigate(sessionStorage.getItem("redirectAfterAuth") || "/");
    sessionStorage.removeItem("redirectAfterAuth");
  }

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsRegistering(true);
    try {
      const recaptchaToken = await recaptchaRef.current?.executeAsync();
      if (recaptchaToken) {
        const recaptchaScore = await verifyReCAPTCHA(
          recaptchaToken,
          recaptchaAction
        );
        console.log(
          `Frontend received reCAPTCHA score: ${JSON.stringify(recaptchaScore)}`
        );
      } else {
        throw new Error("reCAPTCHA token is missing");
      }
      const { token, user } = await register(
        values.username,
        values.password,
        values.invitationCode
      );
      localStorage.setItem("token", token);
      loginContext(user);
      navigate(sessionStorage.getItem("redirectAfterAuth") || "/");
    } catch (err: any) {
      console.error("Failed to register", err);
      alert(`Registration failed: ${err.response.data.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Container fluid className="register-container">
      <Row className="min-vh-100">
        <Col xs={12} md={6} lg={4}>
          <Formik
            initialValues={{
              username: "",
              password: "",
              invitationCode: ""
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, handleChange, values, touched, errors }) => (
              <FormikForm
                noValidate
                className="register-form"
                onSubmit={handleSubmit}
              >
                <h2>Register</h2>
                <br />
                <FloatingLabel
                  controlId="floatingInput"
                  label="Username"
                  className="mb-3"
                >
                  <Field
                    type="text"
                    name="username"
                    placeholder="Username"
                    autoComplete="off"
                    className={`form-control ${
                      touched.username && errors.username ? "is-invalid" : ""
                    }`}
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
                    type="password"
                    name="password"
                    placeholder="Password"
                    className={`form-control ${
                      touched.password && errors.password ? "is-invalid" : ""
                    }`}
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="invalid-feedback"
                  />
                </FloatingLabel>
                <FloatingLabel
                  controlId="floatingInvitationCode"
                  label="Invitation Code"
                  className="mb-3"
                >
                  <Field
                    type="text"
                    name="invitationCode"
                    placeholder="Invitation Code"
                    autoComplete="off"
                    className="form-control"
                  />
                </FloatingLabel>
                {siteKey && (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    size="invisible"
                    sitekey={siteKey}
                  />
                )}
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
              </FormikForm>
            )}
          </Formik>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
