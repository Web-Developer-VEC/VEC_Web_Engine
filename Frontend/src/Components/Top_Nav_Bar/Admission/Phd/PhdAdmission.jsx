import React, { useRef, useState, useEffect } from "react";
import "./PhdAdmission.css";
import point from "../../../Assets/points.png";
import { GiConvergenceTarget } from "react-icons/gi";
import Banner from "../../../Banner";
import PhDAdmissionGuidelines from "./Phd_page";

const PhdAdmission = ({theme, toggle}) => {
  return (
    <>
      <Banner toggle={toggle} theme={theme}
        backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
        headerText="Phd admission"
        subHeaderText="Empowering the next generation of leaders through access to world-class education and opportunities."
      />
      <div class="phd">
        <div className="contain">
          <div className="p-4 left1 border-l-8 border-secd dark:border-drks rounded-xl
            bg-[color-mix(in_srgb,theme(colors.secd)_10%,white)]
            dark:bg-[color-mix(in_srgb,theme(colors.drks)_10%,black)]">
            <h1 className="phd-h1">
              In Velammal Engineering College the following departments are
              recognized research centers of Anna University, Chennai
            </h1>
            <span className="phd-dep">
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Computer Science and Engineering
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Information Technology
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Electronics and Communication Engineering
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Electrical and Electronics Engineering
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Mechanical Engineering
              </p>
              <p>
                <img src={point} alt="" className="phd-logo dark:invert" />
                Physics
              </p>
            </span>
          </div>

          <div className="p-4 right1 border-l-8 p-4 border-secd dark:border-drks rounded-xl
            bg-[color-mix(in_srgb,theme(colors.secd)_10%,white)]
            dark:bg-[color-mix(in_srgb,theme(colors.drks)_10%,black)]">
            <h1 className="phd-h1">PhD (Research) Admission Process & Eligibility</h1>
            <span className="span">
              <p className="chase">
                <img src={point} alt="" className="phd-logo dark:invert" />
                The candidate who wants to pursue PhD / MS (Research) programmes
                (Full Time / Part Time) has to forward his/her application to Anna
                University through our college.
              </p>
                <p className="chase"><img src={point} alt="" className="phd-logo dark:invert" />
                Anna University calls for applications for admission to PhD / MS
                (Research) programmes (Full Time / Part Time) twice in a year,
                normally during September/ October for succeeding year January
                admissions and February / March for July admissions.
              </p>
              <p className="chase">
                <img src={point} alt="" className="phd-logo dark:invert" />
                Qualification and eligibility are as per Anna University
                regulations
              </p>
                <span className="ml-[8px]">
                  (Visit{" "}
                  <a href="https://www.annauniv.edu/research">
                    https://www.annauniv.edu/research
                  </a>
                  )
                </span>
            </span>
          </div>
        </div>
        <PhDAdmissionGuidelines />
      </div>
    </>
  );
};

export default PhdAdmission;
