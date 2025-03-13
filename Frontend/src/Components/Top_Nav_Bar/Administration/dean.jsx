import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dean.css";
import Banner from "../../Banner";

const data = [
  {
    heading: "Academics",
    roles: [
      "Curriculum development through Board of Studies",
      "Autonomous regulations / Online courses",
      "Academic council / Governing Body",
      "Class committee meetings",
      "Academic calendar",
      "Assessments and attainments (PO, CO, PSO)",
      "Course End survey / Exit Survey",
      "Academic Audit / PAC",
      "Academic Records",
      "Formative assessment schedule",
      "Academic Performance Analysis",
      "Professional Society Activities / Symposium",
      "Industrial Visit / Inplant Training",
      "Dept Magazine / News letter",
      "Quality of Internal Question paper / Assignments",
      "Quality of completed Projects and Prototype",
    ]
  },
  {
    heading: "Planning and Development",
    roles: [
      "Constitution of various committees to Autonomy through Univ (BoS/Academic council/FC/GB/GC/PAC)",
      "University Affiliation work",
      "AICTE approval work",
      "Infrastructural development",
      "Budget and expenditure for College",
      "Finance committee meeting",
      "Expansion of new courses",
      "Expanding Computing Network support, computing facilities / Wifi / Internet services / Website of Institution",
      "Support for establishment of new labs in dept",
    ]
  },
  {
    heading: "Student Development and Welfare",
    roles: [
      "Admission and Enrolment / Cancellation",
      "Students online feedback and follow up",
      "Discipline (College and Hostel)",
      "Anti-ragging",
      "Students Grievance and redressal",
      "Scholarships",
      "Bonafide Certificate",
      "Coordination for the conduct of College day / Graduation Day / Sports day / Hostel day",
      "Extra and co-curricular - NSS / NCC / YRC / Cultural competitions",
      "Hostels – Boys / Girls",
      "Food Safety and Hygiene",
      "Gender grievance cell",
      "Students Complaints cell",
      "Mentoring and counselling",
      "Best outgoing student award and other student awards",
    ]
  },
  {
    heading: "Faculty Development and Welfare",
    roles: [
      "Recruitment of regular faculties",
      "Maintaining faculty student ratio, Retention",
      "Maintaining Cadre Proportion",
      "Adjunct / Visiting faculties",
      "Training needs of faculty – FDP / STTP / Workshops",
      "Support for Instructional Methods and Pedagogical Initiatives",
      "Performance Appraisal system",
      "AICTE 360 degree feedback",
      "RTI related matters",
      "Grievance related to faculty",
    ]
  },
  {
    heading: "Research and Development",
    roles: [
      "Sponsored research",
      "Academic research",
      "Publications (SCI, SCIE, Scopus, Books, Book Chapters)",
      "Product development / Consultancy",
      "Patents",
      "Developing research labs and maintaining",
      "Start-up and Entrepreneurships",
      "AICTE - IIC",
      "Research magazine",
    ]
  },
  {
    heading: "Accreditations and Ranking",
    roles: ["NBA", "NAAC", "IQAC", "NIRF ranking", "ARIIA ranking"]
  },
  {
    heading: "Corporate Relations and Higher Studies",
    roles: [
      "Industry Collaborations – MoU",
      "AICTE CII survey",
      "Internship",
      "Placement / Soft skill / Aptitude and other Training",
      "Career guidance and higher studies",
      "Alumni relations, Alumni reunions",
      "Starting Alumni chapter in Metro Cities",
    ]
  },
];

const Dean = ({theme, toggle}) => {

  const [deanData, setDeanData] = useState([]);
  const [loading ,setloading] = useState(true);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/deanandassociates`);
        console.log("HI",response.data);

        setDeanData(response.data);
        setloading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setloading(true);
      } 
    };
    fetchData();
  },[]);

  return (
    <>
    <Banner toggle={toggle} theme={theme}
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="Deans & Associate Deans"
  subHeaderText="Shaping the future through leadership, collaboration, and academic excellence."
/>
    <div className="container">
       {loading && (
          <div className="loading-screen">
            <div className="spinner"></div>
            Loading...
          </div>
        )}
      <div className="de-container">
        {data.map((section, index) => {
          const responsibleDean = deanData.find(
            (dean) => dean.Position === section.heading
          );

          return (
            <div className="de-box min-w-[20vw] bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)]" key={index}>
              <h1 className="de-heading text-accn dark:text-drka">{section.heading}</h1>
              <div className="de-content">
                {/* Profiles Section */}
                {(responsibleDean?.Dean || responsibleDean?.Associate_Dean) && (
                  <div className="de-profiles-section flex flex-wrap lg:flex-nowrap justify-center gap-4 w-full">
                    {/* Dean Profile */}
                    {responsibleDean?.Dean && (
                      <div className="de-profile bg-prim dark:bg-drkp w-full lg:w-[20vw] border-2 border-secd dark:border-drks">
                        <img
                          src={UrlParser(responsibleDean.Dean_Image)} 
                          alt={responsibleDean.Dean}
                        />
                        <div className="de-profile-details">
                          <strong>{responsibleDean.Dean}</strong>
                          <br />
                          <span>{responsibleDean.Dean_Type}</span><br />
                          <span>{responsibleDean.Dean_Designation}</span>
                        </div>
                      </div>
                    )}

                    {/* Associate Dean Profile */}
                    {responsibleDean?.Associate_Dean && (
                      <div className="de-profile bg-prim dark:bg-drkp w-full lg:w-[20vw] border-2 border-secd dark:border-drks">
                        <img
                          src={UrlParser(responsibleDean.Associate_Dean_Image)}
                          alt={responsibleDean.Associate_Dean}
                        />
                        <div className="de-profile-details">
                          <strong>{responsibleDean.Associate_Dean}</strong>
                          <br />
                          <span>{responsibleDean.Ass_Dean_Type}</span><br />
                          <span>{responsibleDean.Associate_Dean_Designation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Roles Section */}
                {/*<div className="de-roles-section">*/}
                {/*  <h2>Roles and Responsibilities</h2>*/}
                {/*  <ul className="de-roles">*/}
                {/*    {section.roles.map((role, i) => (*/}
                {/*      <li className=" bg-prim dark:bg-drkp before:bg-secd dark:before:bg-drks" key={i}>{role}</li>*/}
                {/*    ))}*/}
                {/*  </ul>*/}
                {/*</div>*/}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default Dean;