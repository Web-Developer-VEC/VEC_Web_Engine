import React, { useState } from "react";
import "./AppraisalForm.css";

const Apprasiers_remarks = ({ selectedYear, newAcadamicYear, data, setData }) => {


  /* ================= STATE ================= */

  const defaultState = {
  others: {
    improve_scores_nba_naac_nirf: { value: "", pdf_path: null },
    documentary_evidence_pos_psos: { value: "", pdf_path: null },
    gaps_shortfalls_peos_psos: { value: "", pdf_path: null },
    plan_action_bridge_gap: { value: "", pdf_path: null },
  },
  appraisers_remarks: [
    { name_and_designation: "", remarks: "" },
    { name_and_designation: "", remarks: "" },
  ],
};

const [page5Data, setPage5Data] = useState(() => ({
  ...defaultState,
  ...data,

  others: {
    ...defaultState.others,
    ...(data?.others || {}),
  },

  appraisers_remarks:
    data?.appraisers_remarks?.length
      ? data.appraisers_remarks
      : defaultState.appraisers_remarks,
}));

  // console.log("Sathishkumar", page5Data);
  

  /* ================= HANDLERS ================= */

  const remarkKeys = [
    "improve_scores_nba_naac_nirf",
    "documentary_evidence_pos_psos",
    "gaps_shortfalls_peos_psos",
    "plan_action_bridge_gap",
  ];

const handleRemarkChange = (index, value) => {
  const key = remarkKeys[index];

  setPage5Data((prev) => ({
    ...prev,
    others: {
      ...prev.others,
      [key]: {
        ...prev.others[key],
        value,
      },
    },
  }));
};
const handleAppraiserChange = (index, field, value) => {
  setPage5Data((prev) => {
    const updatedRemarks = [...prev.appraisers_remarks];
    updatedRemarks[index] = {
      ...updatedRemarks[index],
      [field]: value,
    };

    return {
      ...prev,
      appraisers_remarks: updatedRemarks,
    };
  });
};


  React.useEffect(() => {
  if (setData) {
    setData(page5Data);
  }
}, [page5Data]);



  /* ================= RENDER ================= */

  return (
    <>
      {/* ================= REMARKS ================= */}
      <div className="section">
        <div className="section-title">REMARKS</div>

        {[
          "(i) Steps taken (or being taken) for improving scores for NBA / NAAC / NIRF",
          "(ii) Documentary evidences of POs and PSOs attainment levels",
          "(iii) Identification of GAPs / Shortfalls (PEOs, PSOs)",
          "(iv) Plan of action to bridge the gap and its implementation",
        ].map((label, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <label className="form-label" style={{ fontWeight: "bold" }}>
              {label}
            </label>

            <textarea
              rows="5"
              value={
                page5Data.others[remarkKeys[index]].value || ""
              }
              onChange={(e) =>
                handleRemarkChange(index, e.target.value)
              }
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "8px",
                border: "1px solid #999",
                borderRadius: "4px",
                fontFamily: "Times New Roman, serif",
                fontSize: "14px",
              }}
            />
          </div>
        ))}
      </div>

      {/* ================= APPRAISERS REMARKS ================= */}
      <div className="section">
        <div className="section-title">Appraisers Remarks</div>

        {page5Data.appraisers_remarks.map((item, index) => (
          <div key={index} style={{ marginBottom: "25px" }}>
            <label className="form-label" style={{ fontWeight: "bold" }}>
              {index + 1}. Name and Designation
            </label>

            <input
              type="text"
              value={item.name_and_designation}
              onChange={(e) =>
                handleAppraiserChange(
                  index,
                  "name_and_designation",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                marginTop: "6px",
                border: "1px solid #999",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />

            <label
              className="form-label"
              style={{
                fontWeight: "bold",
                marginTop: "10px",
                display: "block",
              }}
            >
              Remarks
            </label>

            <textarea
              rows="4"
              value={item.remarks}
              onChange={(e) =>
                handleAppraiserChange(
                  index,
                  "remarks",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "8px",
                border: "1px solid #999",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default Apprasiers_remarks;