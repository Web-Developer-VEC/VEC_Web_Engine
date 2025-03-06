import { useState } from "react";
import "./Phd_page.css";

const sections = [
  {
    title: "GENERAL ELIGIBILITY",
    content: (
      <div>
        <p>
          <strong>1.1 </strong>Master’s Degree from a University or any other
          qualification recognized as equivalent thereto in the fields of study
          notified from time to time by the University. Specific educational
          qualifications are given in Clause 2.
        </p>
        <p>
          <strong>1.2</strong> A minimum of 55% marks or CGPA of 5.5 on a
          10-point scale in the qualifying examination. In case of
          SC/ST/Differently-abled candidates, 50% marks or CGPA of 5.0 on a
          10-point scale.
        </p>
      </div>
    ),
  },
  {
    title: "EDUCATIONAL QUALIFICATION",
    content: (
      <table className="phd-table">
        <thead>
          <tr>
            <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Sl.No.</th>
            <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Programme</th>
            <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Qualification for Admission</th>
          </tr>
        </thead>
        <tbody>
          <tr className="even:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                    dark:even:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)] bg-prim dark:bg-drkp">
            <td>(i)</td>
            <td>Ph.D. Degree in Engineering/Technology</td>
            <td>
              M.E./M.Tech./M.S. (By Research) in the relevant branch of
              Engineering or Technology
            </td>
          </tr>
          <tr>
            <td>(ii)</td>
            <td>Ph.D. Degree in Science and Humanities</td>
            <td>
              M.Sc. / M.S. (By Research) in the relevant branch of Science and
              Humanities / M.C.A/ M.A. (English/ Communication/ Mass
              Communication/ Journalism/ Media Arts)
            </td>
          </tr>
          <tr>
            <td>(iii)</td>
            <td>Ph.D. Degree in Management Sciences</td>
            <td>
              MBA / Post Graduate Diploma in Business Management or
              Administration awarded by IIM / M.S. (By Research) in Management
              Sciences
            </td>
          </tr>
          <tr>
            <td>(iv)</td>
            <td>Ph.D. Degree in Architecture and Planning</td>
            <td>
              M.Arch./M.Plan. / M.S. (By Research) in Architecture and Planning
            </td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    title: "Ph.D. PROGRAMME",
    subsections: [
      {
        title: "3.1 Full-Time Ph.D. Programme",
        content: (
          <div>
            <p>
              <strong>3.1.1</strong> Candidates under Full-time shall do
              research work in the University Departments / Constituent Colleges
              / Colleges affiliated to the University which are approved
              research departments. Candidates should be available during the
              working hours for curricular and related activities.
            </p>

            <p>
              <strong>3.1.2</strong> Candidates who clear the selection criteria
              of the Ph.D. admission of the University and working in the
              projects undertaken from State / Central / Quasi Government and
              fully funded projects in the University Departments / University
              Colleges / Colleges affiliated to the University shall register
              for the research programme under the supervisorship of the
              Principal Coordinator / Investigator of such projects. Such
              supervisors should be regular teaching faculty as well as
              recognized supervisors of this University. The scholar should be
              appointed in a project sanctioned by a funding agency/organization
              at least for a period of two years. Part-Time employments in
              different spells or in different projects are not permitted. The
              Department/ Centre where the project is undertaken should be the
              recognized research centre of the University and also the working
              place of the Scholar.
            </p>

            <p>
              <strong>3.1.3</strong> Candidates in employment, who want to
              pursue Full-time study, should be sponsored by their employer and
              should avail leave for the minimum duration of the programme
              (Clause 10 of Anna University Ph.D. Regulations) and should get
              formally relieved from their duty to join the research programme.
            </p>

            <p>
              <strong>3.1.4</strong> Candidates who are sponsored by AICTE under
              Quality Improvement Programme for teachers of Engineering Colleges
              and who satisfy the eligibility conditions shall apply for
              Full-time category only, in the Specializations as notified in the
              AICTE guidelines.
            </p>

            <p>
              <strong>3.1.5</strong> Candidates who are selected at National
              level Fellowship programmes or by any recognized bodies and who
              satisfy the eligibility conditions as per the regulations shall
              apply for Full-time category in the respective Specialization.
            </p>

            <p>
              <strong>3.1.6</strong> Foreign Nationals sponsored by the
              Government of India or their respective Governments on any
              exchange programme and who satisfy the eligibility conditions as
              per the Regulations - 2020 shall apply for Full-time category in
              the respective Specialization.
            </p>

            <p>
              <strong>3.1.7</strong> Full-time scholars shall have to sign in
              the attendance register on all working days at the respective
              place of research.
            </p>
          </div>
        ),
      },
      {
        title: "3.2 Part-Time Ph.D. Programme",
        subsections: [
          {
            title: "3.2.1 Part-Time Internal Scholars",
            content:
              "Full-time teaching faculty of University Departments / University Colleges of Anna University and regular teaching faculty of Government Engineering Colleges / Government aided Engineering Colleges / Government Polytechnic Colleges / Government aided Polytechnic Colleges of Tamil Nadu. The nomenclature shall continue for the above scholars till they are in service in the above Institutions",
          },
          {
            title: "3.2.2 Part-Time External Scholars",
            content: (
              <div>
                <p>Eligible candidates for Part-Time External Scholars:</p>
                <ul>
                  <li>
                    Full-time teaching faculty of Self-financing Engineering
                    colleges affiliated to the University / Self-financing
                    Polytechnic Colleges / Colleges affiliated to other UGC
                    recognized Universities.
                  </li>
                  <li>
                    Candidates working in Industrial Units, R&D Departments,
                    National Laboratories, Government / Quasi Government Units,
                    or any other research laboratories within Tamil Nadu, which
                    are recognized by the University as Research Centres and
                    sponsored by the respective employer. The nomenclature shall
                    continue for the above scholars till they are in service in
                    the above Institutions.
                  </li>
                  <li>
                    Candidates working in Industry are eligible to apply for
                    Ph.D. under Part-Time mode, and the supervisor should be
                    from university departments (CEG, ACTECH, MIT & SAP
                    Campuses) of Anna University-Chennai, University College of
                    Engineering - BIT Campus Trichy, AU Regional
                    Campus-Coimbatore, GCT-Coimbatore, GCE-Salem,
                    ACTECH-Karaikudi, PSG Tech-Coimbatore, CIT-Coimbatore, and
                    Thiyagarajar College of Engineering-Madurai.
                    <br />(<a href="#">Click here</a> to view the norms for
                    Ph.D. admission of the scholars from Industry). The
                    candidates shall enclose the NOC from the employer as per
                    the format.
                  </li>
                </ul>
              </div>
            ),
          },
          {
            title: "3.2.3 Place of Research",
            content:
              "The place of research of the Scholar mentioned in clauses 3.2.1 and 3.2.2 shall be the working place of the Supervisor.",
          },
        ],
      },
    ],
  },
  {
    title: "MODE OF SELECTION",
    content: (
      <div>
        <p>
          <strong>4.1</strong> The candidates desirous of registering for Ph.D.
          Programme shall apply by filling all the relevant details mentioned in
          the online application form available in the University website and
          submit online with the approval of the supervisor on or before the due
          date as indicated in the notification issued from time to time.
          University shall issue notification for Ph.D. admission twice every
          year.
        </p>

        <p>
          <strong>4.2</strong> Incomplete applications and applications with
          false information in any respect shall be summarily rejected without
          any intimation to the candidate.
        </p>

        <p>
          <strong>4.3</strong> The Centre for Research shall screen the
          applications as per the eligibility norms, and the Centre for Entrance
          Examinations shall conduct the written test for eligible candidates.
          Candidates appearing for the written test should obtain minimum marks
          as specified by the University to qualify for the interview process.
        </p>

        <p>
          <strong>4.4</strong> The final selection of the candidate for the
          Ph.D. admission shall be based on the overall marks secured by the
          candidate in the Written test (60% weightage) and Interview (40%
          weightage). The syllabus for the Written test is given in the Centre
          for Research Website.
        </p>

        <p>
          <strong>4.5</strong> The syllabus of the Written Test consists of 25%
          of research methodology (Part I) and 75% of the core subject (Part II)
          selected by the candidate. The duration of the Written Test will be 2
          hours and for 100 marks.
        </p>

        <p>
          <strong>4.6</strong> The successful candidates selected for Ph.D.
          admission shall be shortlisted based on the cut-off marks fixed by the
          Research Board.
        </p>
      </div>
    ),
  },
  {
    title: "DURATION OF THE PROGRAMME",
    content: (
      <div>
        <p>Content for Duration of the Programme</p>
        <table className="phd-table">
          <thead>
            <tr>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Sl.No.</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Programme</th>
              <th colspan="2" className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Minimum duration (years)</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Maximum duration (years)</th>
            </tr>
            <tr>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]"></th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]"></th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Full-time</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Part-time</th>
              <th className="bg-gradient-to-r
        from-secd to-[color-mix(in_srgb,theme(colors.secd)_75%,black)]
        dark:from-drks dark:to-[color-mix(in_srgb,theme(colors.drks)_50%,black)]">Full-time/Part-time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-[color-mix(in_srgb,theme(colors.secd),transparent_70%)]
                    dark:even:bg-[color-mix(in_srgb,theme(colors.drks),transparent_70%)] bg-prim dark:bg-drkp">
              <td>1.</td>
              <td>
                <strong>
                  Engineering/Technology/Architecture and Planning
                </strong>
              </td>
              <td>2</td>
              <td>3</td>
              <td>6</td>
            </tr>
            <tr>
              <td>2.</td>
              <td>
                <strong>Science and Humanities</strong>
              </td>
              <td>3</td>
              <td>4</td>
              <td>6</td>
            </tr>
            <tr>
              <td>3.</td>
              <td>
                <strong>Management</strong>
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td>(a) Engineering Qualification</td>
              <td>2</td>
              <td>3</td>
              <td>6</td>
            </tr>
            <tr>
              <td></td>
              <td>(b) Science Qualification</td>
              <td>3</td>
              <td>4</td>
              <td>6</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: "FACULTY FOR THE AWARD OF THE DEGREE",
    content:
      "If the report of the Oral Examination Board is SATISFACTORY, the scholar shall be awarded Ph.D. Degree based on the specialization in which he/she got admission for Ph.D. programme (as per clause 6.1), under the Faculty of Civil Engineering/ Mechanical Engineering/ Electrical Engineering/ Information and Communication Engineering/ Technology/ Architecture and Planning/ Science and Humanities/ Management Sciences, with the approval of the Syndicate.",
  },
];

export default function PhDAdmissionGuidelines() {
  const [openIndex, setOpenIndex] = useState(null);
  const [openSubIndex, setOpenSubIndex] = useState(null);
  const [openNestedSubIndex, setOpenNestedSubIndex] = useState(null);

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
    setOpenSubIndex(null);
    setOpenNestedSubIndex(null);
  };

  const toggleSubSection = (index) => {
    setOpenSubIndex(openSubIndex === index ? null : index);
    setOpenNestedSubIndex(null);
  };

  const toggleNestedSubSection = (index) => {
    setOpenNestedSubIndex(openNestedSubIndex === index ? null : index);
  };

  return (
    <div className="phd-container">
      <h1 className="phd-heading text-[30px]">Admission Guidelines for Ph.D. Programme</h1>
      {sections.map((section, index) => (
        <div key={index} className="phd-section">
          <button
            onClick={() => toggleSection(index)}
            className={`phd-section-title bg-accn dark:bg-drka text-prim ${openIndex === index ? 'openPhd': 'closePhd'}`}
          >
            {section.title}{" "}
            <span className="phd-dropdown-icon">
              {openIndex === index ? "▲" : "▼"}
            </span>
          </button>
          {openIndex === index && (
            <div className="phd-section-content border-l-4 border-accn dark:border-drka">
              {section.subsections ? (
                section.subsections.map((subSection, subIndex) => (
                  <div key={subIndex} className="phd-subsection border-l-4 border-accn dark:border-drka">
                    <button
                      onClick={() => toggleSubSection(subIndex)}
                      className="phd-subsection-title"
                    >
                      {subSection.title}{" "}
                      <span className="phd-dropdown-icon">
                        {openSubIndex === subIndex ? "▲" : "▼"}
                      </span>
                    </button>
                    {openSubIndex === subIndex && (
                      <div className="phd-subsection-content">
                        {subSection.subsections ? (
                          subSection.subsections.map(
                            (nestedSubSection, nestedIndex) => (
                              <div key={nestedIndex} className="phd-subsection border-l-4 border-accn dark:border-drka">
                                <button
                                  onClick={() =>
                                    toggleNestedSubSection(nestedIndex)
                                  }
                                  className="phd-subsection-title"
                                >
                                  {nestedSubSection.title}{" "}
                                  <span className="phd-dropdown-icon">
                                    {openNestedSubIndex === nestedIndex
                                      ? "▲"
                                      : "▼"}
                                  </span>
                                </button>
                                {openNestedSubIndex === nestedIndex && (
                                  <div className="phd-subsection-content">
                                    {nestedSubSection.content}
                                  </div>
                                )}
                              </div>
                            )
                          )
                        ) : (
                          <div>{subSection.content}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div>{section.content}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
