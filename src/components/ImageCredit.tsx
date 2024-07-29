import React, { useState } from "react";
import { IBackgroundImage } from "../assets/BackgroundImage";
import Container from "react-bootstrap/Container";

const ImageCredit: React.FC<Omit<IBackgroundImage, "path">> = ({
  author,
  organisation
}) => {
  return (
    <>
      {author && (
        <small className="text-muted">
          Photo by {author} {organisation && `(${organisation})`}
        </small>
      )}
    </>
  );
};

export default ImageCredit;
