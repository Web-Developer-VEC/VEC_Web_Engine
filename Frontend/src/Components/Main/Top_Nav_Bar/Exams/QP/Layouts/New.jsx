import React, { forwardRef } from "react";
import logo from '../../../../../Assets/LOGOcap.png';

const New = forwardRef(function New(props, ref) {
  const { data, state } = props; 
  const partA = data?.paper?.["PART A"] ?? [];
  const partB = data?.paper?.["PART B"] ?? [];

  const semesterFormat = {
    "1st Semester": "I",
    "2nd Semester": "II",

    "3rd Semester": "III",
    "4th Semester": "IV",

    "5th Semester": "V",
    "6th Semester": "VI",

    "7th Semester": "VII",
    "8th Semester": "VIII",
  };

  const formatQuestion = (text) => {
    if (!text) return null;

    // Normalize excessive spaces
    let normalized = text.replace(/\s{2,}/g, " ").trim();

    // Insert line breaks before (i), (ii), (iii)...
    normalized = normalized.replace(
      /\(\s*(i|ii|iii|iv|v|vi|vii|viii)\s*\)/gi,
      "\n($1)"
    );

    return normalized;
  };

  // const UrlParser = (imgPath) => {
  //   if (!imgPath) return null;
  //   try {
  //     if (data?.sourceFile) {
  //       return new URL(imgPath, data.sourceFile).href;
  //     }
  //     return imgPath;
  //   } catch (e) {
  //     return imgPath;
  //   }
  // };

  const BASE_URL = process.env.REACT_APP_TEST_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const partBGroups = partB.reduce((acc, item) => {
    const qno = item["Q.no"];
    if (!acc[qno]) acc[qno] = [];
    acc[qno].push(item);
    return acc;
  }, {});

  const partBQnos = Object.keys(partBGroups).map(n => Number(n)).sort((a,b) => a - b);

  const partBHead = state?.exam === "III" ? "PART-B (5 × 16 = 80 Marks)" : "PART-B (2 × 15 = 30 Marks)"

  return (
    <div
      className="border-text border w-[70%] mx-auto h-auto min-h-80 p-12 py-16 font-rome printable"
    >
      <div ref={ref} className="printable font-rome">
        <div className="flex justify-end mb-3">
          <div className="border-text border-1 font-bold text-[16pt] w-80 text-start pl-2 reg">Registration No.</div>
        </div>
        {/* HEADER */}
        <header>
          <div className="border-text flex flex-row">
            <div className="basis-1/5 border-1 border-text p-4 flex justify-center">
              <img src={logo} alt="Logo" className="w-28" crossOrigin="anonymous" />
            </div>

            <div className="basis-4/5 flex flex-col justify-center text-center items-center border-1 border-text pl-2 pb-3 font-bold text-[16pt]">
              <h4 className="font-bold text-[16pt] mb-0">Velammal Engineering College</h4>
              <i className="text-[20px]">(An Autonomous institution, Affiliated to Anna university - Chennai)</i>
              <h5 className="font-bold text-[16pt] mb-0">Velammal Newgen park Ambattur - RedHills Road, Chennai - 600 066</h5>
            </div>
          </div>

          <div className="text-center mt-2">
            <h4 className="font-bold text-[16pt]">{data?.examType}</h4>
          </div>

          {/* TOP INFO TABLE */}
          <table className="border-text w-full border-collapse mt-4">
            <tbody>
              <tr className="no-break">
                <td className="border-1 border-text pl-2 pb-2 w-[160px] font-bold text-[16pt]">Subject Code :</td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">{state?.subjectCode ?? "—"}</td>
                <td className="border-1 border-text pl-2 pb-2 w-[100px] font-bold text-[16pt]">Marks :</td>
                <td className="border-1 border-text pl-2 pb-2 w-[160px] font-bold text-[16pt]">{state?.mark} mark</td>
              </tr>

              <tr className="no-break">
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">Subject Title :</td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt] uppercase">{data?.subjectName ?? "—"}</td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">Date :</td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">{state?.date}</td>
              </tr>

              <tr className="no-break">
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">Department :</td>
                <td className="border-1 border-text font-bold text-[16pt]">
                  <ul className="flex pl-2 pb-2 mb-0 gapl-2">
                    {state?.departments?.map((dep,i) => (
                      <li key={i}>{dep}{i < state?.departments.length - 1 ? ', ' : ''}</li>
                    ))}
                  </ul>
                </td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">Time :</td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">{state?.startTime12} to {state?.endTime12}</td>
              </tr>

              <tr className="no-break">
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">Year / Sem :</td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">{state?.year} / {semesterFormat[state?.semester]}</td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">Set :</td>
                <td className="border-1 border-text pl-2 pb-2 font-bold text-[16pt]">{state?.set}</td>
              </tr>
            </tbody>
          </table>
        </header>

        {/* PART - A */}
        <div className="">
          <h3 className="text-center text-[16pt]">Answer All Questions</h3>

          <h5 className="border-text text-center text-[16pt] text-bold">PART-A (10 × 2 = 20 Marks)</h5>

          <table className="w-full table-fixed border-text border-collapse">
            <thead>
              <tr className="no-break he">
                <th className="w-[40px]  text-center text-[16pt]">Q No</th>
                <th className="w-[500px]  text-center text-[16pt]">Questions</th>
                <th className="w-[40px]  text-center text-[16pt]">Marks</th>
                <th className="w-[50px]  text-center text-[16pt]">CO</th>
                <th className="w-[50px]  text-center text-[16pt]">Blooms Level</th>
              </tr>
            </thead>

            <tbody>
              {partA.length > 0 ? (
                partA.map((q, idx) => (
                  <tr className="no-break" key={idx}>
                    <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{q["Q.no"] ?? idx + 1}.</td>
                    <td className=" pl-2 pb-3 min-h-[38px] whitespace-pre-line text-[16pt]">
                      {formatQuestion(q.question)}
                      {q.image ? (
                        <div className="mt-2">
                          <img
                            src={UrlParser(q.image)}
                            alt={`q-${q["Q.no"]}-img`}
                            className="max-w-[500px]"
                            style={{ height: "auto" }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      ) : null}
                    </td>
                    <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{q.marks ?? ""}</td>
                    <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{q.co ?? ""}</td>
                    <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{q["blooms level"] ?? ""}</td>
                  </tr>
                ))
              ) : (
                // placeholder rows while loading/no data
                [1, 2, 3, 4, 5].map(i => (
                  <tr className="no-break" key={i}>
                    <td className=" pl-2 pb-3 min-h-[38px]">{i}.</td>
                    <td className=" pl-2 pb-3 min-h-[38px]">Loading question...</td>
                    <td className=" pl-2 pb-3 min-h-[38px]">—</td>
                    <td className=" pl-2 pb-3 min-h-[38px]">—</td>
                    <td className=" pl-2 pb-3 min-h-[38px]">2</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PART - B */}
        <div className="part-b">
          <div className="part-b-block no-break" data-atomic="true">
            <h5 className="border-text text-center text-bold">{partBHead}</h5>

            <table className="w-full table-fixed border-text border-collapse">
              <thead>
                <tr className="no-break">
                  <th className="w-[30px]"></th>
                  <th className="w-[30px]"></th>
                  <th className="w-[480px]"></th>
                  <th className="w-[40px]"></th>
                  <th className="w-[50px]"></th>
                  <th className="w-[50px]"></th>
                </tr>
              </thead>

              <tbody>
                {partBQnos.length > 0 && (() => {
                  const firstQno = partBQnos[0];
                  const group = partBGroups[firstQno];

                  if (group.length === 2) {
                    const [a, b] = group; 
                    return (
                      <>
                        <tr>
                          <td rowSpan={3} className=" text-center align-top text-[16pt]">{firstQno}.</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt] align-top">(a)</td>
                          <td className=" pl-2 pb-3 min-h-[38px] whitespace-pre-line text-[16pt]">
                            {formatQuestion(a.question)}
                            {a.image ? (
                              <div className="mt-2">
                                <img src={UrlParser(a.image)} alt={`b-${firstQno}-a`} className="w-[500px] mt-2" crossOrigin="anonymous" />
                              </div>
                            ) : null}
                          </td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{a.marks}</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{a.co}</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{a["blooms level"]}</td>
                        </tr>

                        <tr>
                          <td colSpan="5" className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt] pb-2">(OR)</td>
                        </tr>

                        <tr>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt] aligh-top">(b)</td>
                          <td className=" pl-2 pb-3 min-h-[38px] whitespace-pre-line text-[16pt]">
                            {formatQuestion(b.question)}
                            {b.image ? (
                              <div className="mt-2">
                                <img src={UrlParser(b.image)} alt={`b-${firstQno}-a`} className="w-[500px] mt-2" crossOrigin="anonymous" />
                              </div>
                            ) : null}
                          </td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{b.marks}</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{b.co}</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{b["blooms level"]}</td>
                        </tr>
                      </>
                    );
                  }
                })()}
              </tbody>
            </table>
          </div>

          <table className="w-full table-fixed border-text border-collapse">
            <thead>
              <tr className="no-break">
                <th className="w-[30px]"></th>
                <th className="w-[30px]"></th>
                <th className="w-[480px]"></th>
                <th className="w-[40px]"></th>
                <th className="w-[50px]"></th>
                <th className="w-[50px]"></th>
              </tr>
            </thead>

            <tbody>
              {partBQnos.length > 0 ? (
                partBQnos.slice(1).map((qno) => {
                  const group = partBGroups[qno]; // array of options for this qno
                  // render pattern:
                  // if exactly 2 options -> (a) row, (OR) row, (b) row
                  // else -> render each option as a row, showing Q.no only on first row with rowspan = group.length * maybe +1
                  if (group.length === 2) {
                    const first = group[0];
                    const second = group[1];
                    return (
                      <React.Fragment key={qno}>
                        <tr className="no-break">
                          <td rowSpan={3} className=" pl-2 pb-3 min-h-[38px] text-center align-top text-[16pt]">{qno}.</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt] align-top">(a)</td>
                          <td className=" pl-2 pb-3 min-h-[38px] whitespace-pre-line text-[16pt]">
                            {formatQuestion(first.question)}
                            {first.image ? (
                              <div className="mt-2">
                                <img src={UrlParser(first.image)} alt={`b-${qno}-a`} className="w-[500px] mt-2" crossOrigin="anonymous" />
                              </div>
                            ) : null}
                          </td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{first.marks ?? ""}</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{first.co ?? ""}</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{first["blooms level"] ?? ""}</td>
                        </tr>

                        <tr className="no-break">
                          <td colSpan="5" className=" text-center pl-2 pb-3 text-[16pt] min-h-[38px] text-[16pt]">(OR)</td>
                        </tr>

                        <tr className="no-break">
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt] align-top">(b)</td>
                          <td className=" pl-2 pb-3 min-h-[38px] whitespace-pre-line text-[16pt]">
                            {formatQuestion(second.question)}
                            {second.image ? (
                              <div className="mt-2">
                                <img src={UrlParser(second.image)} alt={`b-${qno}-b`} className="w-[500px] mt-2" crossOrigin="anonymous" />
                              </div>
                            ) : null}
                          </td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{second.marks ?? ""}</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{second.co ?? ""}</td>
                          <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{second["blooms level"] ?? ""}</td>
                        </tr>
                      </React.Fragment>
                    );
                  }

                  // generic case (1 or more than 2)
                  return group.map((item, idx) => (
                    <tr className="no-break" key={`${qno}-${idx}`}>
                      {idx === 0 ? (
                        <td rowSpan={group.length} className=" pl-2 pb-3 min-h-[38px] text-center align-top text-[16pt]">{qno}.</td>
                      ) : null}
                      <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{item.option ?? ""}</td>
                      <td className=" pl-2 pb-3 min-h-[38px] whitespace-pre-line text-[16pt]">
                        {formatQuestion(item.question)}
                        {item.image ? (
                          <div className="mt-2">
                            <img src={UrlParser(item.image)} alt={`b-${qno}-${idx}`} className="w-[500px] mt-2" crossOrigin="anonymous" />
                          </div>
                        ) : null} <br />
                      </td>
                      <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{item.marks ?? ""}</td>
                      <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{item.co ?? ""}</td>
                      <td className=" pl-2 pb-3 min-h-[38px] text-center text-[16pt]">{item["blooms level"] ?? ""}</td>
                    </tr>
                  ));
                })
              ) : (
                <tr className="no-break">
                  <td className=" pl-2 pb-3 min-h-[38px]">—</td>
                  <td className=" pl-2 pb-3 min-h-[38px]">—</td>
                  <td className=" pl-2 pb-3 min-h-[38px]">No PART B questions found</td>
                  <td className=" pl-2 pb-3 min-h-[38px]">—</td>
                  <td className=" pl-2 pb-3 min-h-[38px]">—</td>
                  <td className=" pl-2 pb-3 min-h-[38px]">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default New;