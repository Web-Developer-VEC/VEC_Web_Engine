import React, { useEffect, useState } from 'react';
import axios from "axios";
import './AdminPlacementDetails.css';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AdminPlacementDetails = ({ theme, toggle }) => {
  const [showModal, setShowModal] = useState(false);
  const [pdfLink, setPdfLink] = useState("");
  const [placementData, setPlacementData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editMode, setEditMode] = useState(false);
  const [deleteYears, setDeleteYears] = useState([]);
  const [showYearPopup, setShowYearPopup] = useState(false);
  const [tempYear, setTempYear] = useState("");
  const [tempPdf, setTempPdf] = useState(null);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [changes, setChanges] = useState({
    modified: [],
    added: [],
    deleted: []
  });
  const [originalData, setOriginalData] = useState(null);
  const [pageViewMode, setPageViewMode] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/placement`, {
          type: "placement_details"
        });
        const data = response.data?.data || null;
        setPlacementData(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response?.data?.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message } });
        }
        setLoading(true);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }

  const openModal = (link) => {
    setPdfLink(link);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPdfLink("");
  };

  // --- Editing Handlers ---
  const handleCellChange = (section, rowIndex, colIndex, value) => {
    const updatedData = { ...placementData };
    updatedData[section].years[colIndex].values[rowIndex] = value;
    setPlacementData(updatedData);
  };

  const addRow = (section) => {
    const updatedData = { ...placementData };
    updatedData[section].particulars
      ? updatedData[section].particulars.push("")
      : updatedData[section].departments.push("");

    updatedData[section].years.forEach((year) => {
      year.values.push("");
    });

    setPlacementData(updatedData);
  };

  const deleteRow = (section, index) => {
    const updatedData = { ...placementData };
    updatedData[section].particulars
      ? updatedData[section].particulars.splice(index, 1)
      : updatedData[section].departments.splice(index, 1);

    updatedData[section].years.forEach((year) => {
      year.values.splice(index, 1);
    });

    setPlacementData(updatedData);
  };

  const addColumn = (section) => {
    const updatedData = { ...placementData };
    const newYear = "";
    const newValues = new Array(
      updatedData[section].particulars
        ? updatedData[section].particulars.length
        : updatedData[section].departments.length
    ).fill("");
    updatedData[section].years.push({ year: newYear, values: newValues });
    setPlacementData(updatedData);
  };

  const deleteColumn = (section, index) => {
    const updatedData = { ...placementData };
    updatedData[section].years.splice(index, 1);
    setPlacementData(updatedData);
  };

  const deleteSelectedYears = () => {
    const updatedData = { ...placementData };
    updatedData.year_wise_pdfs = updatedData.year_wise_pdfs.filter(
      (year) => !deleteYears.includes(year.year)
    );
    setPlacementData(updatedData);
    setDeleteYears([]);
  };

  // --- FIXED DIFFERENCE FUNCTION ---
  const findDifferences = (obj1, obj2) => {
    let differences = { modified: [], added: [], deleted: [] };
    if (!obj1 || !obj2) return differences;

    // PDFs
    const pdfs1 = obj1.year_wise_pdfs || [];
    const pdfs2 = obj2.year_wise_pdfs || [];

    pdfs1.forEach(pdf1 => {
      if (!pdfs2.find(pdf2 => pdf2.year === pdf1.year)) {
        differences.deleted.push(`year_wise_pdfs: "${pdf1.year}"`);
      }
    });
    pdfs2.forEach(pdf2 => {
      if (!pdfs1.find(pdf1 => pdf1.year === pdf2.year)) {
        differences.added.push(`year_wise_pdfs: "${pdf2.year}"`);
      }
    });
    pdfs1.forEach(pdf1 => {
      const pdf2 = pdfs2.find(p => p.year === pdf1.year);
      if (pdf2 && pdf1.pdf_path !== pdf2.pdf_path) {
        differences.modified.push(`year_wise_pdfs: "${pdf1.year}" (PDF changed)`);
      }
    });

    // Department & Statistics
    const sections = ['department_wise', 'statistics'];
    sections.forEach(section => {
      if (!obj1[section] || !obj2[section]) return;
      const section1 = obj1[section];
      const section2 = obj2[section];

      const rows1 = section1.particulars || section1.departments || [];
      const rows2 = section2.particulars || section2.departments || [];
      const years1 = section1.years || [];
      const years2 = section2.years || [];

      // Added / Deleted rows
      rows1.forEach(row => {
        if (!rows2.includes(row)) {
          differences.deleted.push(`${section}: row "${row}"`);
        }
      });
      rows2.forEach(row => {
        if (!rows1.includes(row)) {
          differences.added.push(`${section}: row "${row}"`);
        }
      });

      // Added / Deleted columns
      years1.forEach(y1 => {
        if (!years2.find(y2 => y2.year === y1.year)) {
          differences.deleted.push(`${section}: column "${y1.year}"`);
        }
      });
      years2.forEach(y2 => {
        if (!years1.find(y1 => y1.year === y2.year)) {
          differences.added.push(`${section}: column "${y2.year}"`);
        }
      });

      // Modified values (compare by rowName + year)
      years1.forEach(y1 => {
        const y2 = years2.find(y => y.year === y1.year);
        if (y2) {
          rows1.forEach((rowName, rowIndex) => {
            if (rows2.includes(rowName)) {
              const idx2 = rows2.indexOf(rowName);
              if (y1.values[rowIndex] !== y2.values[idx2]) {
                differences.modified.push(`${section}: "${rowName}" in "${y1.year}"`);
              }
            }
          });
        }
      });
    });

    return differences;
  };

  const analyzeChanges = () => {
    if (!originalData || !placementData) return;
    const differences = findDifferences(originalData, placementData);
    const hasChanges = differences.modified.length || differences.added.length || differences.deleted.length;
    if (hasChanges) {
      setChanges(differences);
      setShowSavePopup(true);
    } else {
      toast.info("No changes detected");
    }
  };

  const sendRequest = () => {
    console.log("Saving data:", placementData);
    toast.success("Request submitted successfully!");
    setEditMode(false);
    setShowSavePopup(false);
    setOriginalData(JSON.parse(JSON.stringify(placementData)));
  };

  const cancelChanges = () => {
    setPlacementData(JSON.parse(JSON.stringify(originalData)));
    setEditMode(false);
    setChanges({ modified: [], added: [], deleted: [] });
    setDeleteYears([]);
    toast.info("Changes have been reverted");
  };

  const togglePageView = () => {
    setPageViewMode(!pageViewMode);
    if (!pageViewMode) setEditMode(false);
  };

  return (
    <>
      <Banner
        theme={theme}
        toggle={toggle}
        backgroundImage="./Banners/placementbanner.webp"
        headerText="Placement Details"
        subHeaderText="Providing essential placement information and resources to guide students toward successful careers."
      />

      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="placement-wrapper">
        {isLoading ? (
          <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
            <LoadComp txt={""} />
          </div>
        ) : (
          <>
            {/* Edit Button - Hidden in Page View mode */}
            {!pageViewMode && (
              <div className="flex justify-end m-4">
                {!editMode ? (
                  <button className="edit-btn-t" onClick={() => setEditMode(true)}>Edit</button>
                ) : (
                  <button className="cancel-btn-t" onClick={cancelChanges}>Cancel</button>
                )}
              </div>
            )}

            {/* Year-wise PDF Reports */}
            <div className="placement-yearwise font-[poppins] card-plc bg-prim dark:bg-drkts">
              <h4 className='text-text bg-secd dark:drks'>Placement Details Year Wise</h4>
              <div className="place-Sylgrid">
                {placementData?.year_wise_pdfs?.map((year, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      className="place-course-button bg-secd dark:bg-drks text-text"
                      onClick={() => openModal(UrlParser(year.pdf_path))}
                    >
                      <div className="place-course">{year.year}</div>
                    </button>

                    {editMode && !pageViewMode && (
                      <input
                        type="checkbox"
                        checked={deleteYears.includes(year.year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDeleteYears([...deleteYears, year.year]);
                          } else {
                            setDeleteYears(deleteYears.filter((y) => y !== year.year));
                          }
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {editMode && !pageViewMode && (
                <div className="mt-4 flex gap-2">
                  <button className="save-btn" onClick={() => setShowYearPopup(true)}>+ Add Year</button>
                  <button className="delete-btn-editt" onClick={deleteSelectedYears}>🗑 Delete</button>
                </div>
              )}

              {showModal && (
                <div className="place-modal-overlay" onClick={closeModal}>
                  <div className="place-modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="place-close-button" onClick={closeModal}>X</button>
                    <iframe src={pdfLink} title="PDF Viewer" className="place-pdf-viewer"></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* Placement Department-wise Data */}
            <div className="placement-percent font-[poppins] card-plc">
              <h4 className="place-section-title text-brwn dark:text-drkt">
                Placement Details in % - Department Wise
              </h4>
              <div className="table-container overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">DEPARTMENT</th>
                      {placementData?.department_wise?.years?.map((yearObj, colIndex) => (
                        <th className="table-header" key={colIndex}>
                          {editMode && !pageViewMode ? (
                            <input
                              className="edit-input"
                              value={yearObj.year}
                              onChange={(e) => {
                                const updated = [...placementData.department_wise.years];
                                updated[colIndex].year = e.target.value;
                                setPlacementData({ ...placementData, department_wise: { ...placementData.department_wise, years: updated } });
                              }}
                            />
                          ) : (
                            yearObj.year
                          )}
                          {editMode && !pageViewMode && (
                            <button onClick={() => deleteColumn("department_wise", colIndex)}>🗑</button>
                          )}
                        </th>
                      ))}
                      {editMode && !pageViewMode && (
                        <th>
                          <button className="save-btn" onClick={() => addColumn("department_wise")}>+ Column</button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {placementData?.department_wise?.departments?.map((dept, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>
                          {editMode && !pageViewMode ? (
                            <input
                              className="edit-input"
                              value={dept}
                              onChange={(e) => {
                                const updated = [...placementData.department_wise.departments];
                                updated[rowIndex] = e.target.value;
                                setPlacementData({ ...placementData, department_wise: { ...placementData.department_wise, departments: updated } });
                              }}
                            />
                          ) : (
                            dept
                          )}
                          {editMode && !pageViewMode && (
                            <button onClick={() => deleteRow("department_wise", rowIndex)}>🗑</button>
                          )}
                        </td>
                        {placementData.department_wise.years.map((yearObj, colIndex) => (
                          <td key={colIndex}>
                            {editMode && !pageViewMode ? (
                              <input
                                className="edit-input"
                                value={yearObj.values[rowIndex]}
                                onChange={(e) => handleCellChange("department_wise", rowIndex, colIndex, e.target.value)}
                              />
                            ) : (
                              yearObj.values[rowIndex]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {editMode && !pageViewMode && (
                      <tr>
                        <td colSpan={999}>
                          <button className="save-btn" onClick={() => addRow("department_wise")}>+ Row</button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Placement Statistics */}
            <div className="placement-percent font-[poppins] card-plc">
              <h4 className="place-section-title text-brwn dark:text-drkt">
                Placement Statistics
              </h4>
              <div className="table-container overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">PARTICULARS</th>
                      {placementData?.statistics?.years?.map((yearObj, colIndex) => (
                        <th className="table-header" key={colIndex}>
                          {editMode && !pageViewMode ? (
                            <input
                              className="edit-input"
                              value={yearObj.year}
                              onChange={(e) => {
                                const updated = [...placementData.statistics.years];
                                updated[colIndex].year = e.target.value;
                                setPlacementData({ ...placementData, statistics: { ...placementData.statistics, years: updated } });
                              }}
                            />
                          ) : (
                            yearObj.year
                          )}
                          {editMode && !pageViewMode && (
                            <button onClick={() => deleteColumn("statistics", colIndex)}>🗑</button>
                          )}
                        </th>
                      ))}
                      {editMode && !pageViewMode && (
                        <th>
                          <button className="save-btn"  onClick={() => addColumn("statistics")}>+ Column</button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {placementData?.statistics?.particulars?.map((part, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>
                          {editMode && !pageViewMode ? (
                            <input
                              className="edit-input"
                              value={part}
                              onChange={(e) => {
                                const updated = [...placementData.statistics.particulars];
                                updated[rowIndex] = e.target.value;
                                setPlacementData({ ...placementData, statistics: { ...placementData.statistics, particulars: updated } });
                              }}
                            />
                          ) : (
                            part
                          )}
                          {editMode && !pageViewMode && (
                            <button onClick={() => deleteRow("statistics", rowIndex)}>🗑</button>
                          )}
                        </td>
                        {placementData.statistics.years.map((yearObj, colIndex) => (
                          <td key={colIndex}>
                            {editMode && !pageViewMode ? (
                              <input
                                className="edit-input"
                                value={yearObj.values[rowIndex]}
                                onChange={(e) => handleCellChange("statistics", rowIndex, colIndex, e.target.value)}
                              />
                            ) : (
                              yearObj.values[rowIndex]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {editMode && !pageViewMode && (
                      <tr>
                        <td colSpan={999}>
                          <button className="save-btn" onClick={() => addRow("statistics")}>+ Row</button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Save Button - Hidden in Page View mode */}
            {editMode && !pageViewMode && (
              <div className="save-all-wrapper">
                {/* <button className="save-all-btn" onClick={analyzeChanges}>Request</button> */}
              </div>
            )}

            {/* Request Button - Only visible in Page View mode */}
            {pageViewMode && (
              <div className="request-button-cntnr">
                <button className="request-btn-1" onClick={analyzeChanges}>Request</button>
              </div>
            )}

            {/* Popup for Add Year PDF */}
            {showYearPopup && (
              <div className="popup-overlay" onClick={() => setShowYearPopup(false)}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Add Year PDF</h3>
                  <input
                    type="text"
                    placeholder="Enter Year"
                    className="edit-input"
                    value={tempYear}
                    onChange={(e) => setTempYear(e.target.value)}
                  />
                  <input type="file" onChange={(e) => setTempPdf(e.target.files[0])} />
                  <div className="popup-actions">
                    <button
                      className="save-btn"
                      onClick={() => {
                        if (!tempYear || !tempPdf) return;
                        const updatedData = { ...placementData };
                        updatedData.year_wise_pdfs.push({
                          year: tempYear,
                          pdf_path: URL.createObjectURL(tempPdf)
                        });
                        setPlacementData(updatedData);
                        setTempYear("");
                        setTempPdf(null);
                        setShowYearPopup(false);
                      }}
                    >
                      Apply
                    </button>
                    <button
                      className="cancel-btn-t"
                      onClick={() => {
                        setTempYear("");
                        setTempPdf(null);
                        setShowYearPopup(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Changes Popup */}
            {showSavePopup && (
              <div className="popup-overlay" onClick={() => setShowSavePopup(false)}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Review Changes</h3>
                  <p className='note-pop'>Note: Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.</p>
                  
                  <div className="changes-container">
                    {changes.modified.length > 0 && (
                      <div className="change-category">
                        <h4>Modified</h4>
                        <ul>
                          {changes.modified.map((change, index) => (
                            <li key={index}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {changes.added.length > 0 && (
                      <div className="change-category">
                        <h4>Added</h4>
                        <ul>
                          {changes.added.map((change, index) => (
                            <li key={index}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {changes.deleted.length > 0 && (
                      <div className="change-category">
                        <h4>Deleted</h4>
                        <ul>
                          {changes.deleted.map((change, index) => (
                            <li key={index}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="popup-actions">
                    <button className="save-btn" onClick={sendRequest}>
                      Send Request
                    </button>
                    <button 
                      className="cancel-btn-t" 
                      onClick={() => setShowSavePopup(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="page-view-button-container">
              {!pageViewMode ? (
                <button className="page-view-btn" onClick={togglePageView}>
                  Page View
                </button>
              ) : (
                <button className="exit-page-view-btn" onClick={togglePageView}>
                  Exit Page View
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};