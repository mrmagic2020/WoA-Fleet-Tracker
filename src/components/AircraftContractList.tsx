import React, { useState } from "react";
import { ContractType } from "@mrmagic2020/shared/dist/enums";
import { IAircraftContract } from "@mrmagic2020/shared/dist/interfaces";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProgressBar from "react-bootstrap/ProgressBar";
import Spinner from "react-bootstrap/Spinner";
import Currency from "./Currency";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";

function numericInputOnWheel(e: any) {
  e.target.blur();
  setTimeout(() => {
    e.target.focus();
  }, 0);
}

function formatContractProgress(progress: number, type: ContractType) {
  switch (type) {
    case ContractType.Player:
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <span
            style={{
              marginRight: "1rem"
            }}
          >
            Progress:
          </span>
          <ProgressBar
            now={progress * 10}
            label={`${progress * 10}%`}
            striped
            variant="info"
            style={{ flexGrow: 1 }}
          />
        </div>
      );
    default:
      let subProgress = progress,
        subProgressLength = 1;
      while (subProgress >= subProgressLength) {
        subProgress -= subProgressLength;
        if (subProgressLength < 10) subProgressLength++;
      }
      return (
        <>
          <span>
            Progress: {subProgress}/{subProgressLength} ({progress})
          </span>
          <ProgressBar
            now={subProgress * 10}
            max={subProgressLength * 10}
            label={`${((subProgress / subProgressLength) * 100).toFixed(2)}%`}
            striped
            variant="info"
          />
        </>
      );
  }
}

const LogPastProfitsSchema = Yup.object().shape({
  handles: Yup.number().test({
    name: "handles",
    test: (value, ctx) => {
      if (!value) return ctx.createError({ message: "Handles is required" });
      if (isNaN(value)) {
        return ctx.createError({ message: "Handles must be a number" });
      }
      if (value < 1) {
        return ctx.createError({
          message: "Handles must be greater than 0"
        });
      }
      return true;
    }
  }),
  profit: Yup.number().test({
    name: "profit",
    test: (value, ctx) => {
      if (!value) return ctx.createError({ message: "Profit is required" });
      if (isNaN(value)) {
        return ctx.createError({ message: "Profit must be a number" });
      }
      if (value < 0) {
        return ctx.createError({
          message: "Profit must be greater than or equal to 0"
        });
      }
      return true;
    }
  }),
  overwrite: Yup.boolean().default(false)
});

interface LogPastProfitsFormValues
  extends Yup.InferType<typeof LogPastProfitsSchema> {}

interface AircraftContractListProps {
  contracts: IAircraftContract[];
  handleLogProfit?: (contractId: string, newProfit: number) => Promise<void>;
  handleLogPastProfits?: (
    contractId: string,
    handles: number,
    profit: number,
    overwrite: boolean
  ) => Promise<void>;
  handleFinishContract?: (contractId: string) => void;
  handleDeleteContract?: (contractId: string) => void;
  readonly?: boolean;
}

const AircraftContractList: React.FC<AircraftContractListProps> = ({
  contracts,
  handleLogProfit,
  handleLogPastProfits,
  handleFinishContract,
  handleDeleteContract,
  readonly = false
}) => {
  if (
    !readonly &&
    (!handleLogProfit ||
      !handleLogPastProfits ||
      !handleFinishContract ||
      !handleDeleteContract)
  ) {
    throw new Error(
      "handleProfitChange, handleLogProfit, and handleFinishContract are required when readonly is false"
    );
  }
  const [newProfit, setNewProfit] = useState(NaN);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [isShowProfitModalSubmitting, setIsShowProfitModalSubmitting] =
    useState(false);
  const [isProfitLogging, setIsProfitLogging] = useState<{
    [key: string]: boolean;
  }>({});
  const [finishingContract, setFinishingContract] =
    useState<IAircraftContract | null>(null);
  const [deletingContract, setDeletingContract] =
    useState<IAircraftContract | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <Container
        fluid
        style={{
          width: "100%",
          display: "flex",
          overflowX: "auto"
        }}
      >
        <div className="d-flex flex-row flex-nowrap">
          {contracts.map((contract: IAircraftContract, index: number) => (
            <Card
              style={{
                width: "22rem",
                margin: "0.5rem"
              }}
              key={index}
            >
              <Card.Body>
                <Card.Title>
                  {contract.destination}{" "}
                  {contract.finished ? (
                    <Badge bg="success">Finished</Badge>
                  ) : (
                    <Badge bg="warning">Active</Badge>
                  )}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {contract.contractType}
                </Card.Subtitle>
                <br />
                <Card.Text>
                  <ListGroup variant="flush">
                    {contract.contractType === ContractType.Player && (
                      <ListGroup.Item>Player: {contract.player}</ListGroup.Item>
                    )}
                    <ListGroup.Item>
                      Last Handled:{" "}
                      {isNaN(new Date(contract.lastHandled).getTime())
                        ? "N/A"
                        : `${new Date(
                            contract.lastHandled
                          ).toLocaleDateString()} (${Math.floor(
                            (Date.now() -
                              new Date(contract.lastHandled).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )} days ago)`}
                    </ListGroup.Item>
                    <ListGroup.Item
                      style={{ height: "66px", overflow: "auto" }}
                    >
                      Profits: {contract.profits.join(", ")}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Mean Profit:{" "}
                      <Currency
                        value={
                          contract.profits.length
                            ? contract.profits.reduce((a, b) => a + b) /
                              contract.profits.length
                            : 0
                        }
                      />
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Total Profit:{" "}
                      <Currency
                        value={
                          contract.profits.length
                            ? contract.profits.reduce((a, b) => a + b)
                            : 0
                        }
                        decimals={0}
                      />
                    </ListGroup.Item>
                    <ListGroup.Item>
                      {formatContractProgress(
                        contract.progress,
                        contract.contractType
                      )}
                    </ListGroup.Item>
                    {!readonly && (
                      <>
                        {/* Log Profit Button */}
                        {!contract.finished && (
                          <ListGroup.Item>
                            <Form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                if (handleLogProfit) {
                                  setIsProfitLogging({
                                    ...isProfitLogging,
                                    [contract._id]: true
                                  });
                                  await handleLogProfit(
                                    contract._id,
                                    newProfit
                                  );
                                  setNewProfit(NaN);
                                  setIsProfitLogging({
                                    ...isProfitLogging,
                                    [contract._id]: false
                                  });
                                }
                              }}
                            >
                              <Row>
                                <Col>
                                  <Form.Control
                                    type="number"
                                    size="sm"
                                    name="profit"
                                    value={newProfit}
                                    onChange={(e) => {
                                      setNewProfit(parseFloat(e.target.value));
                                    }}
                                    placeholder="Profit"
                                    required
                                    disabled={contract && contract.finished}
                                    onWheel={numericInputOnWheel}
                                  />
                                </Col>
                                <Col>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    type="submit"
                                    disabled={
                                      (contract && contract.finished) ||
                                      isProfitLogging[contract._id]
                                    }
                                  >
                                    {isProfitLogging[contract._id] ? (
                                      <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                      />
                                    ) : (
                                      "Log Profit"
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    style={{
                                      marginLeft: "1rem"
                                    }}
                                    onClick={() => setShowProfitModal(true)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      fill="currentColor"
                                      className="bi bi-three-dots"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                                    </svg>
                                  </Button>
                                </Col>
                              </Row>
                            </Form>
                          </ListGroup.Item>
                        )}

                        {/* Finish/Delete Contract Buttons */}
                        <ListGroup.Item>
                          <Row>
                            {!contract.finished && (
                              <Col>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => {
                                    setFinishingContract(contract);
                                    setShowFinishModal(true);
                                  }}
                                >
                                  Finish Contract
                                </Button>
                              </Col>
                            )}
                            <Col>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setDeletingContract(contract);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete Contract
                              </Button>
                            </Col>
                          </Row>
                        </ListGroup.Item>

                        {/* Finish Contract Modal */}
                        <Modal
                          show={showFinishModal}
                          onHide={() => setShowFinishModal(false)}
                        >
                          <Modal.Header closeButton>
                            <Modal.Title>Finish Contract</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <p>
                              Are you sure you want to finish this contract?
                              This action cannot be undone.
                            </p>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button
                              variant="secondary"
                              onClick={() => setShowFinishModal(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="success"
                              onClick={() => {
                                if (handleFinishContract && finishingContract) {
                                  handleFinishContract(finishingContract._id);
                                }
                                setShowFinishModal(false);
                              }}
                            >
                              Finish
                            </Button>
                          </Modal.Footer>
                        </Modal>

                        {/* Delete Contract Modal */}
                        <Modal
                          show={showDeleteModal}
                          onHide={() => setShowDeleteModal(false)}
                        >
                          <Modal.Header closeButton>
                            <Modal.Title>Delete Contract</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <p>
                              Are you sure you want to delete this contract?
                              This action cannot be undone.
                            </p>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button
                              variant="secondary"
                              onClick={() => setShowDeleteModal(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => {
                                if (handleDeleteContract && deletingContract) {
                                  handleDeleteContract(deletingContract._id);
                                }
                                setShowDeleteModal(false);
                              }}
                            >
                              Delete
                            </Button>
                          </Modal.Footer>
                        </Modal>

                        {/* Profit Modal */}
                        <Modal
                          show={showProfitModal}
                          onHide={() => setShowProfitModal(false)}
                        >
                          <Modal.Header closeButton>
                            <Modal.Title>Log Past Profits</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <p>
                              Log existing profits for this contract by entering
                              the number of handles completed and the total
                              profit for this contract.
                            </p>
                            <Formik
                              initialValues={{
                                overwrite: false
                              }}
                              validationSchema={LogPastProfitsSchema}
                              onSubmit={async (
                                values: LogPastProfitsFormValues
                              ) => {
                                if (handleLogPastProfits) {
                                  setIsShowProfitModalSubmitting(true);
                                  await handleLogPastProfits(
                                    contract._id,
                                    values.handles!,
                                    values.profit!,
                                    values.overwrite
                                  );
                                  setIsShowProfitModalSubmitting(false);
                                  setShowProfitModal(false);
                                }
                              }}
                            >
                              {({
                                handleChange,
                                isSubmitting,
                                values,
                                errors
                              }) => (
                                <FormikForm>
                                  <Row>
                                    <Col>
                                      <FloatingLabel
                                        controlId="floatingInput"
                                        label="Handles"
                                      >
                                        <Field
                                          type="number"
                                          name="handles"
                                          value={values.handles}
                                          onChange={handleChange}
                                          onWheel={numericInputOnWheel}
                                          placeholder="Handles"
                                          className="form-control"
                                        />
                                        <ErrorMessage
                                          name="handles"
                                          component="div"
                                          className="text-danger"
                                        />
                                      </FloatingLabel>
                                    </Col>
                                    <Col>
                                      <FloatingLabel
                                        controlId="floatingInput"
                                        label="Profit"
                                      >
                                        <Field
                                          type="number"
                                          name="profit"
                                          value={values.profit}
                                          onChange={handleChange}
                                          onWheel={numericInputOnWheel}
                                          placeholder="Profit"
                                          className="form-control"
                                        />
                                        <ErrorMessage
                                          name="profit"
                                          component="div"
                                          className="text-danger"
                                        />
                                      </FloatingLabel>
                                    </Col>
                                  </Row>
                                  <Row className="mt-3 mb-3">
                                    <Col>
                                      <Form.Check
                                        type="checkbox"
                                        name="overwrite"
                                        checked={values.overwrite}
                                        onChange={handleChange}
                                        label="Overwrite existing profits"
                                      />
                                    </Col>
                                  </Row>
                                  {values.overwrite && (
                                    <Row>
                                      <Col>
                                        <Alert variant="warning">
                                          <strong>Warning:</strong> This will
                                          overwrite existing profits for this
                                          contract.
                                        </Alert>
                                      </Col>
                                    </Row>
                                  )}
                                  <Row>
                                    <Col>
                                      <Button
                                        type="submit"
                                        variant="outline-primary"
                                        disabled={
                                          isSubmitting ||
                                          Object.keys(errors).length > 0
                                        }
                                      >
                                        {isSubmitting ? (
                                          <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                          />
                                        ) : (
                                          "Submit"
                                        )}
                                      </Button>
                                    </Col>
                                  </Row>
                                </FormikForm>
                              )}
                            </Formik>
                          </Modal.Body>
                        </Modal>
                      </>
                    )}
                  </ListGroup>
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
};

export default AircraftContractList;
