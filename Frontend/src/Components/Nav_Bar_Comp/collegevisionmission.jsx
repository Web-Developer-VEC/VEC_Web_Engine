import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./collegevisionmission.module.css";
import { Eye, Target } from "lucide-react"; // Importing icons
import Banner from "../Banner";

const Collegevisionmission = () => {
  return (
    <>
      <Banner
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Vision & Mission"
        subHeaderText="Empowering a better tomorrow through innovation and integrity"
      />
      <div className={`${styles.clgvisioncard} mx-4`}>
        <div className="row g-4">
          {/* Vision Section */}
          <div className="col-md-6 d-flex align-items-stretch">
            <div className={`${styles.sectioncard} p-4 shadow-lg rounded`}>
              <div className="d-flex align-items-center mb-3">
                <Eye size={32} className="text-white-500 me-3" /> {/* Vision Icon */}
                <h2 className="mb-0">Institute Vision</h2>
              </div>
              <p className="text-gray-600">
                To educate the student community both by theory and practice to
                fit in with society and to conquer tomorrow’s technology at a
                global level with human values through our dedicated team.
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="col-md-6 d-flex align-items-stretch">
            <div className={`${styles.sectioncard} p-4 shadow-lg rounded`}>
              <div className="d-flex align-items-center mb-3">
                <Target size={32} className="text-white-500 me-3" /> {/* Mission Icon */}
                <h2 className="mb-0">Institute Mission</h2>
              </div>
              <p className="text-gray-600">
                To provide world-class education in engineering, technology, and
                management, to foster research & development, to encourage
                creativity and promote innovation, to build leadership,
                intrapreneurship, and entrepreneurship and to nurture teamwork
                and achieve stakeholders’ delight.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Collegevisionmission;
