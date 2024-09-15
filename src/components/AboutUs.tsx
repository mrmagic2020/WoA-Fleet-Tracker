import React, { useEffect, useState } from "react";
import { getRandomBackgroundImage } from "../assets/BackgroundImage";
import Container from "react-bootstrap/Container";
import ImageCredit from "./ImageCredit";
import "../styles/AboutUs.css";

const AboutUs: React.FC = () => {
  const [backgroundImage] = useState(getRandomBackgroundImage());

  return (
    <Container
      fluid
      className="info-container"
      style={{ backgroundImage: `url(${backgroundImage.path})` }}
    >
      <div className="gradient-overlay">
        <Container className="info-card">
          <h1>About Us</h1>
          <p>
            This is a simple, free and open-source web application to track your
            fleet in the game World of Airports. It is a work in progress and is
            not affiliated with the game developers.
          </p>
          <p>
            If you have any questions or suggestions, please contact{" "}
            <code>[MagicAir]mrmagic2023</code> on the{" "}
            <a href="https://discord.gg/worldofairports" target="_blank">
              World of Airports Discord
            </a>
            .
          </p>
          <p>
            You can also view the source code, submit bug reports, and
            contribute to the project on{" "}
            <a
              href="https://github.com/mrmagic2020/WoA-Fleet-Tracker"
              target="_blank"
            >
              GitHub
            </a>
            .
          </p>
        </Container>

        <div className="image-credit">
          <ImageCredit {...backgroundImage} />
        </div>
      </div>
    </Container>
  );
};

export default AboutUs;
