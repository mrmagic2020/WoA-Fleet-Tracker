import React, { useEffect, useState } from "react";
import { getAircraft, createAircraft } from "../services/AircraftService";
import { aircraftTypes } from "../AircraftData";
import { AircraftStatus, AirportCode } from "@mrmagic2020/shared/dist/enums";
import { IAircraft, IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import AircraftList from "./AircraftList";
import { getAircraftGroups } from "../services/AircraftGroupService";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Limits } from "@mrmagic2020/shared/dist/constants";

const NewAircraftSchema = Yup.object().shape({
  ac_model: Yup.string().required("Aircraft model is required"),
  registration: Yup.string()
    .max(Limits.MaxRegistrationCodeLength, "Registration code is too long")
    .required("Registration is required"),
  airport: Yup.string()
    .max(Limits.MaxAirportCodeLength, "Airport code is too long")
    .required("Airport is required"),
  aircraftGroup: Yup.string().nullable()
});

const FleetDashboard: React.FC = () => {
  const [aircraft, setAircraft] = useState<IAircraft[]>([]);
  const [aircraftGroups, setAircraftGroups] = useState<IAircraftGroup[]>([]);

  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const fetchAircraftGroups = async () => {
    const data = await getAircraftGroups();
    setAircraftGroups(data);
  };

  useEffect(() => {
    fetchAircraftGroups();
  }, []);

  const handleCreateAircraft = async (values: any, { resetForm }: any) => {
    setIsCreateLoading(true);
    try {
      if (values.aircraftGroup === "") {
        values.aircraftGroup = null;
      }
      values.size = aircraftTypes.find(
        (a) => a.Aircraft === values.ac_model
      )?.Size;
      values.type = aircraftTypes.find(
        (a) => a.Aircraft === values.ac_model
      )?.Type;
      values.configuration = { e: 0, b: 0, f: 0, cargo: 0 };
      values.status = AircraftStatus.Idle;
      values.totalProfits = 0;
      values.contracts = [];
      await createAircraft(values);
      const data = await getAircraft();
      setAircraft(data);
      resetForm();
    } catch (error: any) {
      if (error.message === "Aircraft already exists") {
        alert("Failed to create aircraft: Aircraft already exists");
      } else {
        alert(`Failed to create aircraft: ${error.message}`);
      }
    } finally {
      setIsCreateLoading(false);
    }
  };

  return (
    <Container fluid>
      <h1 className="text-center mb-4">Fleet Dashboard</h1>

      <AircraftList aircrafts={aircraft} setAircrafts={setAircraft} />

      <Formik
        initialValues={{
          ac_model: "",
          registration: "",
          airport: "",
          aircraftGroup: ""
        }}
        validationSchema={NewAircraftSchema}
        onSubmit={handleCreateAircraft}
      >
        {({ values, handleChange, isSubmitting, touched, errors }) => (
          <FormikForm noValidate>
            <Row>
              <Col xs="auto">
                <Form.Select
                  name="ac_model"
                  className={`form-control ${
                    touched.ac_model && errors.ac_model ? "is-invalid" : ""
                  }`}
                  value={values.ac_model}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select Aircraft
                  </option>
                  {aircraftTypes.map((type) => (
                    <option key={type.Aircraft} value={type.Aircraft}>
                      {type.Aircraft}
                    </option>
                  ))}
                </Form.Select>
                <ErrorMessage
                  name="ac_model"
                  component="div"
                  className="invalid-feedback"
                />
              </Col>
              <Col xs="1">
                <Form.Control
                  plaintext
                  readOnly
                  value={
                    values.ac_model
                      ? aircraftTypes.find(
                          (a) => a.Aircraft === values.ac_model
                        )?.Size
                      : ""
                  }
                />
              </Col>
              <Col xs="1">
                <Form.Control
                  plaintext
                  readOnly
                  value={
                    values.ac_model
                      ? aircraftTypes.find(
                          (a) => a.Aircraft === values.ac_model
                        )?.Type
                      : ""
                  }
                />
              </Col>
              <Col xs="auto">
                <Field
                  type="text"
                  name="registration"
                  placeholder="Registration"
                  autoComplete="off"
                  className={`form-control ${
                    touched.registration && errors.registration
                      ? "is-invalid"
                      : ""
                  }`}
                  required
                />
                <ErrorMessage
                  name="registration"
                  component="div"
                  className="invalid-feedback"
                />
              </Col>
              <Col xs="auto">
                <Form.Select
                  name="airport"
                  value={values.airport}
                  onChange={handleChange}
                  className={`form-control ${
                    touched.airport && errors.airport ? "is-invalid" : ""
                  }`}
                  required
                >
                  <option value="" disabled>
                    Select Airport
                  </option>
                  {Object.values(AirportCode).map((airport) => (
                    <option key={airport} value={airport}>
                      {airport}
                    </option>
                  ))}
                </Form.Select>
                <ErrorMessage
                  name="airport"
                  component="div"
                  className="invalid-feedback"
                />
              </Col>
              <Col xs="auto">
                <Form.Select
                  name="aircraftGroup"
                  value={values.aircraftGroup}
                  onChange={handleChange}
                  className={`form-control ${
                    touched.aircraftGroup && errors.aircraftGroup
                      ? "is-invalid"
                      : ""
                  }`}
                >
                  <option value="">Select Group</option>
                  {aircraftGroups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </Form.Select>
                <ErrorMessage
                  name="aircraftGroup"
                  component="div"
                  className="invalid-feedback"
                />
              </Col>
              <Col>
                <Button
                  variant="outline-primary"
                  type="submit"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                >
                  {isCreateLoading ? "Creating..." : "Create"}
                </Button>
              </Col>
            </Row>
          </FormikForm>
        )}
      </Formik>
    </Container>
  );
};

export default FleetDashboard;
