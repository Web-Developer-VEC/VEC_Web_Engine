import React, { useState } from 'react'
import './PlacementDetails.css'
import './Syllabi.css'
import Banner from '../Banner';
export const PlacementDetails = () => {

    const [showModal, setShowModal] = useState(false);
    const [pdfLink, setPdfLink] = useState("");

    const placement_percent_data = {
        headers: ['DEPARTMENT', '2015-19', '2016-20', '2017-21', '2018-22', '2019-23', '2020-24*'],
        rows: [
          { department: 'CSE', data: [99, 89, 88, 43, 24, 79] },
          { department: 'ECE', data: [31, 13, 45, 98, 4, 76] },
          { department: 'EEE', data: [7, 65, 76, 97, 67, 87] },
          { department: 'MECH', data: [96, 76, 95, 98, 80, 88]},
          { department: 'IT', data: [95, 96, 100, 98, 90, 75]},
          { department: 'EIE', data: [83, 89, 90, 83, 100, 76]},
          { department: 'CIVIL', data: [76, 88, 88, 93, 80, 100]},
          { department: 'AUTO', data: [71, 74, 94, 88, 93, 80]},
          { department: 'AI & DS', data: ['-', '-', '-', '-', 99, 100] },
          { department: 'Over All', data: [91, 90, 95, 96, 92, 83]},
        ],
      };

      const placement_statistics = {
        headers: ['PARTICULARS', '2015-19', '2016-20', '2017-21', '2018-22', '2019-23', '2020-24*'],
        rows: [
          { particular: 'Number of Companies visited', data: [328, 227, 233, 250, 208, 294] },
          { particular: 'Number of Students registered for Placements', data: [785, 722, 620, 665, 534, 563] },
          { particular: 'Number of Students Placed', data: [719, 655, 589, 643, 494, 471] },
          { particular: 'Total Number of Offers', data: [989, 871, 897, 1059, 651, 602] },
          { particular: 'Placement Percentage', data: [91.59, 90.72, 95.00, 96.69, 92.51, 83.66]},
          { particular: 'Average Salary', data: ['4.10 LPA', '4.30 LPA', '4.54 LPA', '4.66 LPA', '6.10 LPA', '6.15 LPA'  ]},
        ],
      };

    const yearwise_data = [
        {
          year: "Placement Details – Year Wise",
          courses: [
            [
              { name: "2010 - 11", link: "https://velammal.edu.in/wp-content/uploads/2021/09/Campus_Recruitment2010-11" },
              { name: "2011 - 12", link: "https://velammal.edu.in/wp-content/uploads/2021/09/CampusRecruitment2011-12.pdf" },
              { name: "2012 - 13", link: "https://velammal.edu.in/wp-content/uploads/2021/09/CampusRecruitment2012-13.pdf" }
            ],
            [
              { name: "2013 - 14", link: "https://velammal.edu.in/wp-content/uploads/2021/09/CampusRecruitment2013-14.pdf" },
              { name: "2014 - 15", link: "https://velammal.edu.in/wp-content/uploads/2021/09/CampusRecruitmentfinal2014-15.pdf" },
              { name: "2015 - 16", link: "https://velammal.edu.in/wp-content/uploads/2021/09/CampusRecruitmentfinal2015-16.pdf" }
            ],
            [
              { name: "2016 - 17", link: "https://velammal.edu.in/wp-content/uploads/2021/09/CampusRecruitmentfinal2016-17.pdf" },
              { name: "2017 - 18", link: "https://velammal.edu.in/wp-content/uploads/2022/02/Campus-Recruitment-2014-18_updated2022.pdf" },
              { name: "2018 - 19", link: "https://velammal.edu.in/wp-content/uploads/2022/05/2015-2019.pdf" }
            ],
            [
              { name: "2019 - 20", link: "https://velammal.edu.in/wp-content/uploads/2022/05/2016-2020.pdf" },
              { name: "2020 - 21", link: "https://velammal.edu.in/wp-content/uploads/2022/05/2017-2021.pdf" },
              { name: "2021 - 22", link: "https://velammal.edu.in/wp-content/uploads/2022/07/Career-index_VEC_2018-22_batch.pdf" },
            ],
            [
              { name : "2022 - 23", link: "https://velammal.edu.in/wp-content/uploads/2023/10/Career-Index_VEC_2019-23_batch.pdf"},
              { name: "2023 - 24", link: "https://velammal.edu.in/wp-content/uploads/2023/10/Career_Index_2020-24.pdf"}
            ]
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
  headerText="Placement Details"
  subHeaderText="Providing essential placement information and resources to guide students toward successful careers."
/>


    <div>
    <div className="placement-percent card">
      <h4>Placement Details in % - Department Wise</h4>
      <table>
        <thead>
          <tr>
            {placement_percent_data.headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {placement_percent_data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th>{row.department}</th>
              {row.data.map((value, cellIndex) => (
                <td key={cellIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h5 style={{ paddingTop: '50px' }}>* Recruitment still in progress (As on 6th Jan 2025)</h5>
    </div>

        <div className="placement-yearwise card">
            <h4>Placement Details – Year Wise</h4>
                <div className="syl-container">
                    {yearwise_data.map((entry, index) => (
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
            </div>

            <div className="placement-percent card">
      <h4>Placement Statistics</h4>
      <table>
        <thead>
          <tr>
            {placement_statistics.headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {placement_statistics.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th>{row.particular}</th>
              {row.data.map((value, cellIndex) => (
                <td key={cellIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h5 style={{ paddingTop: '50px' }}>* Recruitment still in progress (As on 6th Jan 2025)</h5>
    </div>
        </div>
        </>
    )
}

