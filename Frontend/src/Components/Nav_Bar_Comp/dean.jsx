import React from "react";
import "./Dean.css";

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
    ],
    dean: {
      name: "Dr. A. Jebamalar",
      title: "Prof & Head – Civil Engineering",
      image: "/images/dean.jpg",
    },
    associateDean: {
      name: "Dr. M. Arockia Jaswin",
      title: "Prof. Mechanical Engg.",
      image: "/images/ass.jpg",
    },
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
    ],
    dean: {
      name: "Dr. Jeeva Katiravan",
      title: "Prof and Head – Information Technology",
      image: "/images/dean.jpg",
    },
    associateDean: {
      name: "Dr. S. Rajalakshmi",
      title: "AP – CSE",
      image: "/images/ass.jpg",
    },
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
    ],
    dean: {
      name: "Dr. S. Shahil Kirupavathy",
      title: "Prof and Head – Department of Physics",
      image: "/images/dean.jpg",
    },
    associateDean: {
      name: "Dr. Geetha R",
      title: "AP - EEE",
      image: "/images/ass.jpg",
    },
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
    ],
    dean: {
      name: "Dr. S Mary Jones",
      title: "Prof & Head – Department of Electronics and Communication Engg.",
      image: "/images/dean.jpg",
    },
    associateDean: {
      name: "Dr. R.S.Lekshmi",
      title: "Asst Prof – Head – MBA",
      image: "/images/ass.jpg",
    },
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
    ],
    dean: {
      name: "Dr. A. Balaji Ganesh",
      title: "Prof - Dept of Computer Science",
      image: "/images/dean.jpg",
    },
    associateDean: {
      name: "Dr. S. Bhaskara Sethupathy",
      title: "Prof & Head – Automobile Engineering",
      image: "/images/ass.jpg",
    },
  },
  {
    heading: "Accreditations and Ranking",
    roles: ["NBA", "NAAC", "IQAC", "NIRF ranking", "ARIIA ranking"],
    dean: {
      name: "Dr. E Ganapathy Sundaram",
      title: "Prof & Head – Mech. Engineering",
      image: "/images/dean.jpg",
    },
    associateDean: {
      name: "Dr. P. Visu",
      title: "Prof – CSE",
      image: "/images/ass.jpg",
    },
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
    ],
    dean: {
      name: "Mr. Arun Ramasamy",
      title: "Head – Placements",
      image: "/images/dean.jpg",
    },
    associateDean: {
      name: "Dr. K. Suresh Kumar",
      title: "Asso. Prof – EEE",
      image: "/images/ass.jpg",
    },
  },
];

const Dean = () => {
  return (
    <div className="de-container">
      {data.map((section, index) => (
        <div className="de-box" key={index}>
          <h1 className="de-heading">{section.heading}</h1>
          <div className="de-content">
            {/* Profiles Section */}
            <div className="de-profiles-section">
              {[section.dean, section.associateDean].map((profile, idx) => (
                <div className="de-profile" key={idx}>
                  <img src={profile.image} alt={profile.name} />
                  <div className="de-profile-details">
                    <strong>{profile.name}</strong>
                    <br />
                    <span>{profile.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Roles Section */}
            <div className="de-roles-section">
            <h2 style={{ marginTop: '-30px' }}>Roles and Responsibilities</h2>
              <ul className="de-roles">
                {section.roles.map((role, i) => (
                  <li key={i}>{role}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
 
export default Dean;