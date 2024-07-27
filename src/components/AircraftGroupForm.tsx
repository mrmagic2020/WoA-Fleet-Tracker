import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAircraftGroup,
  updateAircraftGroup,
  getAircraftGroupById
} from "../services/AircraftGroupService";
import { AircraftGroupVisibility } from "@mrmagic2020/shared/dist/enums";
import { IAircraftGroup } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import LoadingFallback from "./LoadingFallback";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Limits } from "@mrmagic2020/shared/dist/constants";

const NewAircraftGroupSchema = Yup.object().shape({
  name: Yup.string()
    .max(Limits.MaxAircraftGroupNameLength, "Name is too long")
    .required("Name is required"),
  description: Yup.string().max(
    Limits.MaxAircraftGroupDescriptionLength,
    "Description is too long"
  ),
  colour: Yup.string().required("Colour is required"),
  visibility: Yup.string()
    .oneOf(Object.values(AircraftGroupVisibility))
    .required("Visibility is required"),
  aircrafts: Yup.array().default([]),
  _id: Yup.string().default("")
});

interface AircraftGroupFormValues
  extends Yup.InferType<typeof NewAircraftGroupSchema> {}

const AircraftGroupForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Partial<IAircraftGroup>>({
    name: "",
    description: "",
    colour: "#000000",
    visibility: AircraftGroupVisibility.Public,
    aircrafts: [],
    _id: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchGroup = async () => {
        const data = await getAircraftGroupById(id);
        setGroup(data);
      };
      fetchGroup();
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setGroup({ ...group, [name]: value });
  };

  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateAircraftGroup(id, group);
        navigate("/aircraftGroups/" + id);
      } else {
        await createAircraftGroup(group);
        navigate("/aircraftGroups");
      }
    } catch (error: any) {
      console.error("Error creating/updating aircraft group:", error);
    }
  };

  const handleSubmit = async (values: AircraftGroupFormValues) => {
    try {
      if (id) {
        await updateAircraftGroup(id, values);
        navigate("/aircraftGroups/" + id);
      } else {
        await createAircraftGroup(values);
        navigate("/aircraftGroups");
      }
    } catch (error: any) {
      console.error("Error creating/updating aircraft group:", error);
    }
  };

  if (id && !group._id) {
    return <LoadingFallback />;
  }

  return (
    <Container fluid>
      <Formik
        initialValues={{
          name: group.name || "",
          description: group.description || "",
          colour: group.colour || "#000000",
          visibility: group.visibility || AircraftGroupVisibility.Public,
          aircrafts: group.aircrafts || [],
          _id: group._id || ""
        }}
        validationSchema={NewAircraftGroupSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, values, isSubmitting, touched, errors }) => (
          <FormikForm noValidate>
            <h2>{id ? "Edit Aircraft Group" : "Create Aircraft Group"}</h2>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Field
                type="text"
                name="name"
                autoComplete="off"
                className={`form-control ${
                  touched.name && errors.name ? "is-invalid" : ""
                }`}
                required
              />
              <ErrorMessage
                name="name"
                component="div"
                className="invalid-feedback"
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Field
                as="textarea"
                name="description"
                className={`form-control ${
                  touched.description && errors.description ? "is-invalid" : ""
                }`}
              />
              <ErrorMessage
                name="description"
                component="div"
                className="invalid-feedback"
              />
            </Form.Group>
            <Form.Group controlId="colour">
              <Form.Label>Colour</Form.Label>
              <Form.Control
                type="color"
                name="colour"
                value={values.colour}
                className={`form-control ${
                  touched.colour && errors.colour ? "is-invalid" : ""
                }`}
                onChange={handleChange}
                required
              />
              <ErrorMessage
                name="colour"
                component="div"
                className="invalid-feedback"
              />
            </Form.Group>
            <Form.Group controlId="visibility">
              <Form.Label>Visibility</Form.Label>
              <Form.Select
                name="visibility"
                value={values.visibility}
                className={`form-control ${
                  touched.visibility && errors.visibility ? "is-invalid" : ""
                }`}
                required
                onChange={handleChange}
              >
                {Object.values(AircraftGroupVisibility).map((visibility) => (
                  <option key={visibility} value={visibility}>
                    {visibility}
                  </option>
                ))}
              </Form.Select>
              <ErrorMessage
                name="visibility"
                component="div"
                className="invalid-feedback"
              />
            </Form.Group>
            {values.visibility === AircraftGroupVisibility.Private && (
              <Alert variant="success" className="mt-3">
                This group is private and can only be viewed by you.
              </Alert>
            )}
            {values.visibility === AircraftGroupVisibility.Registered && (
              <Alert variant="warning" className="mt-3">
                This group can be viewed by anyone with a WoA Fleet Tracker
                account.
              </Alert>
            )}
            {values.visibility === AircraftGroupVisibility.Public && (
              <Alert variant="danger" className="mt-3">
                This group is public and can be viewed by anyone with a link.
              </Alert>
            )}
            <Button
              variant="outline-primary"
              type="submit"
              className="mt-3"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {id ? "Update" : "Create"}
            </Button>
          </FormikForm>
        )}
      </Formik>
    </Container>
  );
};

export default AircraftGroupForm;
