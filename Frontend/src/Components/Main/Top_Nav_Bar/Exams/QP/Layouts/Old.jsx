import React, { forwardRef } from "react";
import logo from '../../../../../Assets/LOGOcap.png';

const Old = forwardRef(function Old(props, ref) {
    const { data, state } = props; 
    const partA = data?.paper?.["PART A"] ?? [];
    const partB = data?.paper?.["PART B"] ?? [];
    const partC = data?.paper?.["PART C"] ?? [];

    const semesterFormat = {
      "1st Semester": "I",
      "2nd Semester": "I",

      "3rd Semester": "II",
      "4th Semester": "II",

      "5th Semester": "III",
      "6th Semester": "III",

      "7th Semester": "IV",
      "8th Semester": "IV",
    };

    const resolveImage = (imgPath) => {
      if (!imgPath) return null;
      try {
        if (data?.sourceFile) {
          return new URL(imgPath, data.sourceFile).href;
        }
        return imgPath;
      } catch (e) {
        return imgPath;
      }
    };

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

    const partCGroups = partC.reduce((acc, item) => {
      const qno = item["Q.no"];
      if (!acc[qno]) acc[qno] = [];
      acc[qno].push(item);
      return acc;
    }, {});

    const partCQnos = Object.keys(partCGroups).map(n => Number(n)).sort((a,b) => a - b);

    const OPTION_LENGTH_LIMIT = 40;

    const formatOptions = (options) => {
      if (!options) return [];

      const entries = Object.entries(options).map(
        ([key, value]) => `${key}) ${value}`
      );

      const hasLongOption = entries.some(opt => opt.length > OPTION_LENGTH_LIMIT);

      if (hasLongOption) {
        // one option per line
        return entries.map(opt => [opt]);
      }

      // two options per line
      const rows = [];
      for (let i = 0; i < entries.length; i += 2) {
        rows.push(entries.slice(i, i + 2));
      }
      return rows;
    };
    
    return (
      <div
        className="border-text border w-[70%] mx-auto h-auto min-h-80 p-12 py-16 font-rome printable"
        ref={ref}
      >
        {/* HEADER */}
        <header>
          <div className="border-text flex flex-row">
            <div className="basis-1/5 border-1 border-text p-4">
              <img src={logo} alt="Logo" className="w-26 h-26" crossOrigin="anonymous" />
            </div>
  
            <div className="basis-4/5 flex flex-col justify-center text-center items-center border-1 border-text p-2">
              <h4>VELAMMAL ENGINEERING COLLEGE</h4>
              <i>(An Autonomous institution, Affiliated to Anna university - Chennai)</i>
              <h4>Velammal Newgen park Ambattur - RedHills Road, Chennai - 600 066</h4>
            </div>
          </div>
  
          <div className="text-center mt-2">
            <h4>{data?.examType}</h4>
          </div>
  
          {/* TOP INFO TABLE */}
          <table className="border-text w-full border-collapse mt-4">
            <tbody>
              <tr className="no-break">
                <td className="border-1 border-text p-2 h-[38px] w-[160px] font-bold">Subject Code :</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">{data?.subjectcode ?? "—"}</td>
                <td className="border-1 border-text p-2 h-[38px] w-[160px] font-bold">Marks :</td>
                <td className="border-1 border-text p-2 h-[38px] w-[160px] font-bold">{state?.mark} mark</td>
              </tr>
  
              <tr className="no-break">
                <td className="border-1 border-text p-2 h-[38px] font-bold">Subject Title :</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">{data?.subjectName ?? "—"}</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">Date :</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">{state?.date}</td>
              </tr>
  
              <tr className="no-break">
                <td className="border-1 border-text p-2 h-[38px] font-bold">Department :</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">
                  <ul className="flex pl-0 mb-0 gap-2">
                    {state?.departments?.map((dep,i) => (
                      <li key={i}>{dep}{i < state?.departments.length - 1 ? ',' : ''}</li>
                    ))}
                  </ul>
                </td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">Time :</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">{state?.startTime12} to {state?.endTime12}</td>
              </tr>
  
              <tr className="no-break">
                <td className="border-1 border-text p-2 h-[38px] font-bold">Year / Sem :</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">{state?.year} / {semesterFormat[state?.semester]}</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">Set :</td>
                <td className="border-1 border-text p-2 h-[38px] font-bold">{state?.set}</td>
              </tr>
            </tbody>
          </table>
        </header>

        {/* PART - A */}
        <div className="mt-6">
          <h3 className="text-center">Answer All Questions</h3>

          <h5 className="border-text text-center mt-2 p-1">PART-A (10 × 1 = 10  Marks)</h5>

          <table className="w-full table-fixed border-text border-collapse">
            <thead>
              <tr className="no-break">
                <th className="w-[60px] border-1 border-text p-2 min-h-[38px]">Q No</th>
                <th className="w-[500px] border-1 border-text p-2 min-h-[38px]">Questions</th>
                <th className="w-[60px] border-1 border-text p-2 min-h-[38px]">CO</th>
                <th className="w-[70px] border-1 border-text p-2 min-h-[38px]">Blooms Level</th>
              </tr>
            </thead>
            <tbody>
              {partA.length > 0 ? (
                partA.map((q, index) => (
                  <tr className="no-break" key={index}>
                    <td className="border-1 border-text p-2 min-h-[38px]">
                      {q["Q.no"] ?? index + 1}.
                    </td>

                    <td className="border-1 border-text p-2 min-h-[38px] whitespace-pre-line">
                      {q.question}

                      <div className="mt-1 space-y-1">
                        {formatOptions(q.options).map((row, idx) => (
                          <div key={idx} className="flex gap-8">
                            {row.map((opt, i) => (
                              <span key={i} className="flex-1">
                                {opt}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>

                      {q.image && (
                        <div className="mt-2">
                          <img
                            src={resolveImage(q.image)}
                            alt={`partA-${q["Q.no"]}`}
                            className="max-w-full mt-2"
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}
                    </td>

                    <td className="border-1 border-text p-2 min-h-[38px]">
                      {q.co ?? ""}
                    </td>

                    <td className="border-1 border-text p-2 min-h-[38px]">
                      {q["blooms level"] ?? ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-break">
                  <td colSpan={4} className="border-1 border-text p-2 text-center">
                    No PART-A questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  
        {/* PART - B */}
        <div className="mt-6">
          <h5 className="border-text text-center mt-2 p-1">PART-B (10 × 2 = 20 Marks)</h5>
  
          <table className="w-full table-fixed border-text border-collapse">
            <thead>
              <tr className="no-break">
                <th className="w-[60px] border-1 border-text p-2 min-h-[38px]">Q No</th>
                <th className="w-[500px] border-1 border-text p-2 min-h-[38px]">Questions</th>
                <th className="w-[60px] border-1 border-text p-2 min-h-[38px]">CO</th>
                <th className="w-[70px] border-1 border-text p-2 min-h-[38px]">Blooms Level</th>
                <th className="w-[50px] border-1 border-text p-2 min-h-[38px]">Marks</th>
              </tr>
            </thead>
  
            <tbody>
              {partB.length > 0 ? (
                partB.map((q, idx) => (
                  <tr className="no-break" key={idx}>
                    <td className="border-1 border-text p-2 min-h-[38px]">{q["Q.no"] ?? idx + 1}.</td>
                    <td className="border-1 border-text p-2 min-h-[38px] whitespace-pre-line">
                      {q.question}
                      {q.image ? (
                        <div className="mt-2">
                          <img
                            src={resolveImage(q.image)}
                            alt={`q-${q["Q.no"]}-img`}
                            className="max-w-full mt-2"
                            crossOrigin="anonymous"
                          />
                        </div>
                      ) : null}
                    </td>
                    <td className="border-1 border-text p-2 min-h-[38px]">{q.co ?? ""}</td>
                    <td className="border-1 border-text p-2 min-h-[38px]">{q["blooms level"] ?? ""}</td>
                    <td className="border-1 border-text p-2 min-h-[38px]">{q.marks ?? ""}</td>
                  </tr>
                ))
              ) : (
                // placeholder rows while loading/no data
                [1, 2, 3, 4, 5].map(i => (
                  <tr className="no-break" key={i}>
                    <td className="border-1 border-text p-2 min-h-[38px]">{i}.</td>
                    <td className="border-1 border-text p-2 min-h-[38px]">Loading question...</td>
                    <td className="border-1 border-text p-2 min-h-[38px]">—</td>
                    <td className="border-1 border-text p-2 min-h-[38px]">—</td>
                    <td className="border-1 border-text p-2 min-h-[38px]">2</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
  
        {/* PART - C */}
        <div className="mt-10">
          <h5 className="border-text text-center p-1">PART-C (2 × 15 = 30 Marks)</h5>
  
          <table className="w-full table-fixed border-text border-collapse">
            <thead>
              <tr className="no-break">
                <th className="w-[60px] border-1 border-text p-2 min-h-[38px]">Q No</th>
                <th className="w-[60px] border-1 border-text p-2 min-h-[38px]">Option</th>
                <th className="w-[450px] border-1 border-text p-2 min-h-[38px]">Question</th>
                <th className="w-[60px] border-1 border-text p-2 min-h-[38px]">Marks</th>
                <th className="w-[60px] border-1 border-text p-2 min-h-[38px]">CO</th>
                <th className="w-[70px] border-1 border-text p-2 min-h-[38px]">Blooms Level</th>
              </tr>
            </thead>
  
            <tbody>
              {partCQnos.length > 0 ? (
                partCQnos.map((qno) => {
                  const group = partCGroups[qno]; // array of options for this qno
                  // render pattern:
                  // if exactly 2 options -> (a) row, (OR) row, (b) row
                  // else -> render each option as a row, showing Q.no only on first row with rowspan = group.length * maybe +1
                  if (group.length === 2) {
                    const first = group[0];
                    const second = group[1];
                    return (
                      <React.Fragment key={qno}>
                        <tr className="no-break">
                          <td rowSpan={3} className="border-1 border-text p-2 min-h-[38px] align-top">{qno}.</td>
                          <td className="border-1 border-text p-2 min-h-[38px]">(a)</td>
                          <td className="border-1 border-text p-2 min-h-[38px] whitespace-pre-line">
                            {first.question}
                            {first.image ? (
                              <div className="mt-2">
                                <img src={resolveImage(first.image)} alt={`b-${qno}-a`} className="max-w-full mt-2" crossOrigin="anonymous" />
                              </div>
                            ) : null}
                          </td>
                          <td className="border-1 border-text p-2 min-h-[38px]">{first.marks ?? ""}</td>
                          <td className="border-1 border-text p-2 min-h-[38px]">{first.co ?? ""}</td>
                          <td className="border-1 border-text p-2 min-h-[38px]">{first["blooms level"] ?? ""}</td>
                        </tr>
  
                        <tr className="no-break">
                          <td colSpan="5" className="border-1 border-text text-center p-2 font-bold min-h-[38px]">(OR)</td>
                        </tr>
  
                        <tr className="no-break">
                          <td className="border-1 border-text p-2 min-h-[38px]">(b)</td>
                          <td className="border-1 border-text p-2 min-h-[38px] whitespace-pre-line">
                            {second.question}
                            {second.image ? (
                              <div className="mt-2">
                                <img src={resolveImage(second.image)} alt={`b-${qno}-b`} className="max-w-full mt-2" crossOrigin="anonymous" />
                              </div>
                            ) : null}
                          </td>
                          <td className="border-1 border-text p-2 min-h-[38px]">{second.marks ?? ""}</td>
                          <td className="border-1 border-text p-2 min-h-[38px]">{second.co ?? ""}</td>
                          <td className="border-1 border-text p-2 min-h-[38px]">{second["blooms level"] ?? ""}</td>
                        </tr>
                      </React.Fragment>
                    );
                  }
  
                  // generic case (1 or more than 2)
                  return group.map((item, idx) => (
                    <tr className="no-break" key={`${qno}-${idx}`}>
                      {idx === 0 ? (
                        <td rowSpan={group.length} className="border-1 border-text p-2 min-h-[38px] align-top">{qno}.</td>
                      ) : null}
                      <td className="border-1 border-text p-2 min-h-[38px]">{item.option ?? ""}</td>
                      <td className="border-1 border-text p-2 min-h-[38px] whitespace-pre-line">
                        {item.question}
                        {/* {item.image ? ( */}
                          <div className="mt-2">
                            <img src={resolveImage(item.image)} alt={`b-${qno}-${idx}`} className="max-w-full mt-2" crossOrigin="anonymous" />
                          </div>
                        {/* ) : null} */}
                      </td>
                      <td className="border-1 border-text p-2 min-h-[38px]">{item.marks ?? ""}</td>
                      <td className="border-1 border-text p-2 min-h-[38px]">{item.co ?? ""}</td>
                      <td className="border-1 border-text p-2 min-h-[38px]">{item["blooms level"] ?? ""}</td>
                    </tr>
                  ));
                })
              ) : (
                <tr className="no-break">
                  <td className="border-1 border-text p-2 min-h-[38px]">—</td>
                  <td className="border-1 border-text p-2 min-h-[38px]">—</td>
                  <td className="border-1 border-text p-2 min-h-[38px]">No PART B questions found</td>
                  <td className="border-1 border-text p-2 min-h-[38px]">—</td>
                  <td className="border-1 border-text p-2 min-h-[38px]">—</td>
                  <td className="border-1 border-text p-2 min-h-[38px]">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
});

export default Old;