import React, { useState } from 'react';
import './Syllabi.css'; // Import the CSS file
import Banner from '../Banner';

const Syllabus = () => {
  const [showModal, setShowModal] = useState(false);
  const [pdfLink, setPdfLink] = useState("");

  const data = [
    {
      year: "For the students admitted from 2023 - 2024",
      courses: [
        [
          { name: "B.E. Automobile Engineering", link: "https://euacademic.org/bookupload/9.pdf" },
          { name: "B.E. Civil Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf" },
          { name: "B.E. Computer Science and Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf" }
        ],
        [
          { name: "B.E. Computer Science and Engineering (Cyber Security)", link: "https://velammal.edu.in/wp-content/uploads/2023/08/Cybersecurity-R2023-CURRICULUM.pdf" },
          { name: "B.E. Electronics and Communication Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/ECE-R2023-CURRICULUM.pdf" },
          { name: "B.E. Electrical and Electronics Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/EEE-R2023-CURRICULUM.pdf" }
        ],
        [
          { name: "B.E. Electronics and Instrumentation Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/R_2023_EIE_Curriculum_I%20and_II_sem_to_COE.pdf" },
          { name: "B.Tech. Information Technology", link: "https://velammal.edu.in/wp-content/uploads/2023/08/IT-R2023-CURRICULUM.pdf" },
          { name: "B.Tech. Artificial Intelligence and Data Science", link: "https://velammal.edu.in/wp-content/uploads/2023/08/AIDS-R2023-CURRICULUM.pdf" }
        ],
        [
          { name: "B.E. Mechanical Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/MEch-R2023-CURRICULUM.pdf" },
          { name: "M.E. Computer Science and Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/EEE%20PG-R2023-Curriculum.pdf" },
          { name: "M.E. Power Systems Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/MBA-R%202023-Curriculum.pdf" }
        ],
        [
          { name: "MBA – Master of Business Administration", link: "https://velammal.edu.in/wp-content/uploads/2023/08/MBA-R%202023-Curriculum.pdf" }
        ]
      ]
    }, 
    {
        year: "Verticals Offered",
        courses: [
          [
            { name: "B.E. Automobile Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Dept._of_Automobile_Engg._%20ELECTRIC_VEHICLES.pdf" },
            { name: "B.E. Civil Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Dept._of_Civil_Engineering_Construction_Management-Civil.pdf" },
            { name: "B.E. Computer Science and Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Verticals_CSE.pdf" }
          ],
          [
            { name: "B.E. Electronics and Communication Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Dept._of_Electronics_and_Communication_Engg._RF_TECHNOLOGIES.pdf" },
            { name: "B.E. Electrical and Electronics Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Dept._of_Electrical_and_Electronics_Engg._ELECTRIC_VEHICLE_TECHNOLOGY_EEE.pdf" },
            { name: "B.E. Electronics and Instrumentation Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Dept._of%20_Electronics_and_Instrumentation%20_Engg._AUTOMATION.pdf" },
          ],
          [
            { name: "B.Tech. Information Technology", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Verticals_ITDept.pdf" },
            { name: "B.Tech. Artificial Intelligence and Data Science", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Verticals_AIDS%20Dept.pdf" },
            { name: "B.E. Mechanical Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/Vertificals_Offered_2023-24/Dept._of_Mechanical_Engg._ROBOTICSANDAUTOMATION.pdf" },
          ],
        ]
      },
      {
        year: "For the students admitted during 2021 & 2022",
        courses: [
          [
            { name: "B.E. Automobile Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/1.-R2019-Automobile.pdf" },
            { name: "B.E. Civil Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/2.-R2019-Civil-Engineering-CBCS-Curriculum-with-course-code-21XXXXX-21.01.2023.pdf" },
            { name: "B.E. Computer Science and Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/07/students-admitted-during-2021-2022-CSE-final.pdf" }
          ],
          [
            { name: "B.E. Electronics and Communication Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/4.-ECE_R2019-21-COURSE-CODE-CURRICULUM-AND-SYLLABUS-18.1.2023-sent-for-clge-web-1.pdf" },
            { name: "B.E. Electrical and Electronics Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/5.-BE-EEE-updated-R2019-with-21XX-CODE.pdf" },
            { name: "B.E. Electronics and Instrumentation Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/6.-EIE_Full-Autonomous-Syllabus_-R2019-with-2021-Course-Code.pdf" },
          ],
          [
            { name: "B.Tech. Information Technology", link: "https://velammal.edu.in/wp-content/uploads/2023/07/REVISED-R192021-AND-2022-ADMITTED-STUDENTS-IT-CURRICULUM-AND-SYLLABUS.pdf" },
            { name: "B.Tech. Artificial Intelligence and Data Science", link: "https://velammal.edu.in/wp-content/uploads/2023/07/AIDS-Curriculum-Syllabus-DURING-20212022-.pdf" },
            { name: "B.E. Mechanical Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/8.-R2019-B.E-Mechanical-Curriculum-with-Course-Codes-21XXXXXX.pdf" },
          ],
          [
            { name: "M.E. Computer Science and Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/10.-M.E-CSE-curriculum-and-syllabus-with-subcode-21xxx.pdf" },
            { name: "M.E. Power Systems Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/01/11.-ME-PSE-updated-R2019-with-21XX-CODE.pdf" },
            { name: "MBA – Master of Business Administration", link: "https://velammal.edu.in/wp-content/uploads/2023/01/12.-MBA-Curriculum-and-Syllabus-2019-1-1-E-REVISED.pdf" }
          ],
        ]
      }, 
      {
        year: "For the students admitted during 2019 & 2020",
        courses: [
          [
            { name: "B.E. Automobile Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/Auto-R2023-CURRICULUM.pdf" },
            { name: "B.E. Civil Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/Civil-R2023-CURRICULUM.pdf" },
            { name: "B.E. Computer Science and Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/CSE-R2023-CURRICULUM-1.pdf" }
          ],
          [
            { name: "B.E. Electronics and Communication Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/ECE-R2023-CURRICULUM.pdf" },
            { name: "B.E. Electrical and Electronics Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/EEE-R2023-CURRICULUM.pdf" },
            { name: "B.E. Electronics and Instrumentation Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/R_2023_EIE_Curriculum_I%20and_II_sem_to_COE.pdf" },
          ],
          [
            { name: "B.Tech. Information Technology", link: "https://velammal.edu.in/wp-content/uploads/2023/08/IT-R2023-CURRICULUM.pdf" },
            { name: "B.Tech. Artificial Intelligence and Data Science", link: "https://velammal.edu.in/wp-content/uploads/2023/08/AIDS-R2023-CURRICULUM.pdf" },
            { name: "B.E. Mechanical Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/MEch-R2023-CURRICULUM.pdf" },
          ],
          [
            { name: "M.E. Computer Science and Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/EEE%20PG-R2023-Curriculum.pdf" },
            { name: "M.E. Power Systems Engineering", link: "https://velammal.edu.in/wp-content/uploads/2023/08/MBA-R%202023-Curriculum.pdf" },
            { name: "MBA – Master of Business Administration", link: "https://velammal.edu.in/wp-content/uploads/2023/08/MBA-R%202023-Curriculum.pdf" },
          ],
        ]
      }, 
  ];

  const openModal = (link) => {
    setPdfLink(link);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPdfLink("");
  };

  return (
    <>
<Banner
  backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
  headerText="Course & Syllabus"
  subHeaderText="Providing a comprehensive guide to academic excellence, empowering students through structured learning."
/>


    <div className="syl-container">
      {data.map((entry, index) => (
        <div key={index} className="syllabus-section">
          <div className="syllabus-header">
            <h3>{entry.year}</h3>
          </div>
          <div className="syllabus-content">
            <div className="Sylgrid">
              {entry.courses.map((row, rowIndex) => {
                return row.map((course, cellIndex) => (
                  <button
                    key={`${rowIndex}-${cellIndex}`}
                    className="course-button"
                    onClick={() => openModal(course.link)}
                  >
                    <div className="course">
                      {course.name}
                    </div>
                  </button>
                ));
              })}
            </div>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>X</button>
            <iframe src={pdfLink} title="PDF Viewer" className="pdf-viewer"></iframe>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Syllabus;
