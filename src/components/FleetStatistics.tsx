import React, { useEffect, useState } from "react";
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { getAircraft } from "../services/AircraftService";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Currency from "./Currency";
import { IAircraft } from "@mrmagic2020/shared/dist/interfaces";
import {
  AirportCode,
  AircraftSize,
  AircraftType
} from "@mrmagic2020/shared/dist/enums";

Chart.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const FleetStatistics: React.FC = () => {
  const [aircrafts, setAircrafts] = useState<IAircraft[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<AirportCode | "ALL">(
    "ALL"
  );
  const [selectedSize, setSelectedSize] = useState<AircraftSize | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<AircraftType | "ALL">("ALL");

  useEffect(() => {
    const fetchAircrafts = async () => {
      const aircraftData = await getAircraft();
      setAircrafts(aircraftData);
    };

    fetchAircrafts();
  }, []);

  // Filter logic
  const filteredAircrafts = aircrafts.filter((aircraft) => {
    return (
      (selectedAirport === "ALL" || aircraft.airport === selectedAirport) &&
      (selectedSize === "ALL" || aircraft.size === selectedSize) &&
      (selectedType === "ALL" || aircraft.type === selectedType)
    );
  });

  // Stats logic
  const aircraftCountBySize = filteredAircrafts.reduce(
    (acc, aircraft) => {
      acc[aircraft.size]++;
      return acc;
    },
    { S: 0, M: 0, L: 0, X: 0 }
  );

  const aircraftCountByStatus = filteredAircrafts.reduce(
    (acc, aircraft) => {
      acc[aircraft.status]++;
      return acc;
    },
    { Idle: 0, "In Service": 0, Sold: 0 }
  );

  const aircraftCountByAirport = filteredAircrafts.reduce((acc, aircraft) => {
    acc[aircraft.airport] = (acc[aircraft.airport] || 0) + 1;
    return acc;
  }, {} as Record<AirportCode, number>);

  const totalProfits = filteredAircrafts.reduce(
    (acc, aircraft) => acc + aircraft.totalProfits,
    0
  );

  // Pie chart data for Aircraft Sizes
  const sizePieData = {
    labels: ["S", "M", "L", "X"],
    datasets: [
      {
        data: [
          aircraftCountBySize.S,
          aircraftCountBySize.M,
          aircraftCountBySize.L,
          aircraftCountBySize.X
        ],
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0"]
      }
    ]
  };

  const statusPieData = {
    labels: ["Idle", "In Service", "Sold"],
    datasets: [
      {
        data: [
          aircraftCountByStatus.Idle,
          aircraftCountByStatus["In Service"],
          aircraftCountByStatus.Sold
        ],
        backgroundColor: ["#FF6384", "#4BC0C0", "#FFCE56"]
      }
    ]
  };

  // Bar chart data for Aircraft per Airport
  const barData = {
    labels: Object.keys(aircraftCountByAirport),
    datasets: [
      {
        label: "Aircraft Count",
        data: Object.values(aircraftCountByAirport),
        backgroundColor: "#36A2EB"
      }
    ]
  };

  return (
    <Container>
      <h1 className="text-center my-4">Fleet Statistics</h1>

      {/* Filters */}
      <Form className="mb-4">
        <Row>
          <Col md={4}>
            <Form.Group controlId="airportFilter">
              <Form.Label>Filter by Airport</Form.Label>
              <Form.Control
                as="select"
                value={selectedAirport}
                onChange={(e) =>
                  setSelectedAirport(e.target.value as AirportCode)
                }
              >
                <option value="ALL">All Airports</option>
                {Object.values(AirportCode).map((airport) => (
                  <option key={airport} value={airport}>
                    {airport}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="sizeFilter">
              <Form.Label>Filter by Size</Form.Label>
              <Form.Control
                as="select"
                value={selectedSize}
                onChange={(e) =>
                  setSelectedSize(e.target.value as AircraftSize)
                }
              >
                <option value="ALL">All Sizes</option>
                <option value={AircraftSize.Small}>Small</option>
                <option value={AircraftSize.Medium}>Medium</option>
                <option value={AircraftSize.Large}>Large</option>
                <option value={AircraftSize.Xlarge}>X-Large</option>
              </Form.Control>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="typeFilter">
              <Form.Label>Filter by Type</Form.Label>
              <Form.Control
                as="select"
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as AircraftType)
                }
              >
                <option value="ALL">All Types</option>
                <option value={AircraftType.PAX}>Passenger</option>
                <option value={AircraftType.CARGO}>Cargo</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Charts */}
      <Row className="mb-4">
        <Col>
          <Card
            className="p-3"
            style={{
              width: "25vw"
            }}
          >
            <h5 className="text-center">Aircraft Sizes</h5>
            <div className="d-flex justify-content-center">
              <Pie
                data={sizePieData}
                options={{
                  plugins: {
                    datalabels: {
                      color: "#fff",
                      formatter: (value: number, context: any) => {
                        if (value) {
                          const label =
                            context.chart.data.labels[context.dataIndex];
                          return `${label}: ${value}`;
                        }
                        return "";
                      },
                      font: {
                        weight: "bold"
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>

        <Col>
          <Card
            className="p-3"
            style={{
              width: "25vw"
            }}
          >
            <h5 className="text-center">Aircraft Status</h5>
            <div className="d-flex justify-content-center">
              <Pie
                data={statusPieData}
                options={{
                  plugins: {
                    datalabels: {
                      color: "#fff",
                      formatter: (value: number, context: any) => {
                        if (value) {
                          const label =
                            context.chart.data.labels[context.dataIndex];
                          return `${label}: ${value}`;
                        }
                        return "";
                      },
                      font: {
                        weight: "bold"
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>

        <Col>
          <Row className="mb-3">
            <Card className="p-3">
              <Row className="text-center">
                <Col xs={12} sm={6}>
                  <h5>Aircraft Count</h5>
                  <h3>{filteredAircrafts.length}</h3>
                </Col>
                <Col xs={12} sm={6}>
                  <h5>Total Profits</h5>
                  <h3>
                    <Currency value={totalProfits} decimals={0} />
                  </h3>
                </Col>
              </Row>
            </Card>
          </Row>
          <Row>
            <Card className="p-3">
              <h5 className="text-center">Aircraft per Airport</h5>
              <Bar
                data={barData}
                options={{
                  plugins: {
                    datalabels: {
                      color: "#fff",
                      formatter: (value: number, context: any) => {
                        if (value) {
                          return `${value}`;
                        }
                        return "";
                      },
                      font: {
                        weight: "bold"
                      }
                    }
                  }
                }}
              />
            </Card>
          </Row>
        </Col>
      </Row>

      {/* Statistics Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Model</th>
            <th>Size</th>
            <th>Type</th>
            <th>Registration</th>
            <th>Airport</th>
            <th>Status</th>
            <th>Total Profits</th>
          </tr>
        </thead>
        <tbody>
          {filteredAircrafts.map((aircraft) => (
            <tr key={aircraft._id}>
              <td>{aircraft.ac_model}</td>
              <td>{aircraft.size}</td>
              <td>{aircraft.type}</td>
              <td>{aircraft.registration}</td>
              <td>{aircraft.airport}</td>
              <td>{aircraft.status}</td>
              <td>${aircraft.totalProfits.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default FleetStatistics;
