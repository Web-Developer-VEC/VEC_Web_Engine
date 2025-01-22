import React from 'react';
import './UgAdmission.css';

const UgAdmission = () => {
    const Admission_1st_year = {
        year_data: '2025 - 26', 
        headers: ['UG COURSES', 'GOVERNMENT QUOTA INTAKE', 'MANAGEMENT QUOTA INTAKE', 'TOTAL INTAKE'],
        rows: [
          { particular: 'B.E. Automobile Engineering', data: [20, 10, 30] },
          { particular: 'B.E. Civil Engineering', data: [20, 10, 30] },
          { particular: 'B.E. Computer Science & Engineering', data: [156, 84, 240] },
          { particular: 'B.E. Computer Science & Engineering (Cyber Security)', data: [39, 21, 60] },
          { particular: 'B.E. Electronics and Communication Engineering', data: [156, 84, 240] },
          { particular: 'B.E. Electrical and Electronics Engineering', data: [39, 21, 60] },
          { particular: 'B.E. Electronics & Instrumentation Engineering', data: [20, 10, 30] },
          { particular: 'B.E. Mechanical Engineering', data: [39, 21, 60] },
          { particular: 'B.Tech. Artificial Intelligence & Data Science', data: [78, 42, 120] },
          { particular: 'B.Tech. Information Technology', data: [78, 42, 120] },
        ],
      };

      const Admission_2nd_year = {
        year_data: '2025 - 26', 
        headers: ['UG COURSES', 'GOVERNMENT QUOTA INTAKE', 'MANAGEMENT QUOTA INTAKE', 'TOTAL INTAKE'],
        rows: [
          { particular: 'B.E. Automobile Engineering', data: ['02', '01', '03'] },
          { particular: 'B.E. Civil Engineering', data: ['20', '01', '03'] },
          { particular: 'B.E. Computer Science & Engineering', data: ['16', '08', '24'] },
          { particular: 'B.E. Electronics and Communication Engineering', data: ['16', '08', '24'] },
          { particular: 'B.E. Electrical and Electronics Engineering', data: ['04', '02', '06'] },
          { particular: 'B.E. Electronics & Instrumentation Engineering', data: ['02', '01', '03'] },
          { particular: 'B.E. Mechanical Engineering', data: ['04', '02', '06'] },
          { particular: 'B.Tech. Artificial Intelligence & Data Science', data: ['08', '04', '12'] },
          { particular: 'B.Tech. Information Technology', data: ['08', '04', '12'] },
        ],
      };

  return (
    <div className='Admission'>
        <div className="B-E">
            <h1>Admission</h1>
            <h3>B.E./B.Tech. Degree Programme</h3>
        </div>

        <div className="ADM-content">
            <p className="description-text">Should have passed the Higher Secondary Examinations of (10+2) Curriculum (Academic Stream) prescribed by the Government of Tamil Nadu with Mathematics, Physics, and Chemistry as three of the four subjects of study under Part-III or any examination of any other University or authority accepted by the Syndicate of Anna University as equivalent thereto.</p>
            <p className="description-text">( OR )</p>
            <p className="description-text">Should have passed the Higher Secondary Examination of Vocational stream (Vocational groups in Engineering / Technology) as prescribed by the Government of Tamil Nadu.</p>

            <div className="table-container">
                <h4>UG COURSES - TOTAL INTAKE {Admission_1st_year.year_data}</h4>
                <h6>(For First Year Admissions)</h6>
                <div className="table-card">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                {Admission_1st_year.headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Admission_1st_year.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <th>{row.particular}</th>
                                    {row.data.map((value, cellIndex) => (
                                        <td key={cellIndex}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="ADM-content lateral-entry">
            <h5>Lateral Entry Admission</h5>
            <p className="description-text">Candidates possessing a Diploma in Engineering/Technology awarded by the State Board of Technical Education, Tamilnadu or its equivalent are eligible for Lateral entry admission to the third semester of B.E./B.Tech. as per the rules fixed by the Govt. of Tamilnadu.</p>
            <p className="description-text">( OR )</p>
            <p className="description-text">Candidates possessing a Degree in Science (B.Sc.,) (10+2+3 stream) with Mathematics as a subject at the B.Sc. level are eligible for Lateral entry admission to the third semester of B.E./B.Tech.</p>

            <p className="description-text">Such candidates shall undergo two additional Engineering subject(s) in the third and fourth semesters as prescribed by the Board of Studies/Institution.</p>

            <div className="table-container">
                <h4>UG COURSES - TOTAL INTAKE {Admission_2nd_year.year_data}</h4>
                <h5>Lateral Entry/Second Year Admission</h5>
                <h6>(For Diploma Holders Only)</h6>
                <div className="table-card">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                {Admission_2nd_year.headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Admission_2nd_year.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <th>{row.particular}</th>
                                    {row.data.map((value, cellIndex) => (
                                        <td key={cellIndex}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  )
}

export default UgAdmission;
