import React, { useEffect } from "react";
import {
  IAircraft,
  IAircraftContract
} from "@mrmagic2020/shared/dist/interfaces";
import {
  uploadImage,
  fetchImage,
  deleteImage
} from "../services/FleetImageService";
import FetchFleetImage from "../assets/FleetImage";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Image from "react-bootstrap/Image";
import Currency from "./Currency";
import Spinner from "react-bootstrap/Spinner";
import "../styles/AircraftDetailsListGroup.css";

interface AircraftDetailsListGroupProps {
  aircraft: IAircraft;
  customItems?: JSX.Element[];
  readonly?: boolean;
}

async function FetchFleetDefaultOrCustomImage(
  ac_model: string,
  aircraftId: string
): Promise<[string, boolean]> {
  try {
    const imageURL = await fetchImage(aircraftId);
    if (imageURL) {
      return [imageURL, true];
    }
  } catch (error: any) {
    console.error("Error fetching image:", error);
  }
  return [FetchFleetImage(ac_model), false];
}

const AircraftDetailsListGroup: React.FC<AircraftDetailsListGroupProps> = ({
  aircraft,
  customItems,
  readonly = false
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [imageURL, setImageURL] = React.useState<string>("");
  const [hasCustomImage, setHasCustomImage] = React.useState<boolean>(false);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  useEffect(() => {
    if (selectedFile) return;
    FetchFleetDefaultOrCustomImage(aircraft.ac_model, aircraft._id).then(
      ([url, isCustomImage]) => {
        setImageURL(url);
        setHasCustomImage(isCustomImage);
      }
    );
  }, [aircraft.ac_model, aircraft._id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageURL(URL.createObjectURL(file));
    }
  };

  const handleImageDelete = async () => {
    try {
      await deleteImage(aircraft._id);
      setImageURL(FetchFleetImage(aircraft.ac_model));
      setHasCustomImage(false);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleImageClick = () => {
    if (hasCustomImage) {
      handleImageDelete();
      return;
    }
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const response = await uploadImage(selectedFile, aircraft._id);
      setHasCustomImage(true);
      console.log("Image uploaded successfully:", response);
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
      console.error("Error uploading image:", error);
      setImageURL(FetchFleetImage(aircraft.ac_model));
    } finally {
      setSelectedFile(null);
      setIsUploading(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <ListGroup>
            <ListGroup.Item>Model: {aircraft.ac_model}</ListGroup.Item>
            <ListGroup.Item>Size: {aircraft.size}</ListGroup.Item>
            <ListGroup.Item>Type: {aircraft.type}</ListGroup.Item>
            <ListGroup.Item>
              Registration: {aircraft.registration}
            </ListGroup.Item>
            <ListGroup.Item>Airport: {aircraft.airport}</ListGroup.Item>
            <ListGroup.Item>Status: {aircraft.status}</ListGroup.Item>
            <ListGroup.Item>
              Total Contracts: {aircraft.contracts.length}
            </ListGroup.Item>
            <ListGroup.Item>
              Total Income:{" "}
              <Currency
                value={aircraft.contracts.reduce(
                  (acc: number, contract: IAircraftContract) =>
                    acc +
                    contract.profits.reduce(
                      (acc: number, profit: number) => acc + profit,
                      0
                    ),
                  0
                )}
              />
            </ListGroup.Item>
            {customItems &&
              customItems.map((item, index) => (
                <ListGroup.Item key={index}>{item}</ListGroup.Item>
              ))}
          </ListGroup>
        </Col>
        <Col xs="auto" className="image-container">
          <Row xs="auto" onClick={handleImageClick}>
            <Image
              className="upload-image"
              width={400}
              src={imageURL}
              alt={aircraft.ac_model}
              rounded
            />
            {!readonly && (
              <div className="overlay-text">
                {hasCustomImage
                  ? "Remove Image"
                  : "Click to upload a new image"}
              </div>
            )}
          </Row>
          {!readonly && !hasCustomImage && (
            <Row xs="auto">
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {selectedFile && (
                <Button
                  className="upload-button ms-2"
                  size="sm"
                  variant="outline-secondary"
                  disabled={!selectedFile}
                  onClick={handleUpload}
                >
                  {isUploading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                      />
                      <span className="ms-2">Uploading...</span>
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              )}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AircraftDetailsListGroup;
