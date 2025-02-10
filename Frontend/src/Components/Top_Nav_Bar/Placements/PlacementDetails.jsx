import React, { useEffect, useState } from 'react';
import axios from "axios";
import './PlacementDetails.css';
import Banner from '../../Banner';

export const PlacementDetails = () => {
    const [showModal, setShowModal] = useState(false);
    const [pdfLink, setPdfLink] = useState("");
    const [placementData, setPlacementData] = useState(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/placementsdata`);
                setPlacementData(response.data[0]?.Placement_Details || null);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error.message);
                setLoading(true);
            }
        };
        fetchData();
    }, []);

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
              {isLoading && (
                <div className="loading-screen">
                  <div className="spinner"></div>
                    Loading...
                  </div>
              )}
                {/* Placement Department-wise Data */}
                <div className="placement-percent card">
                    <h4>Placement Details in % - Department Wise</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>DEPARTMENT</th>
                                {placementData?.Department_wise?.years?.map((year, index) => (
                                    <th key={index}>{year}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {placementData?.Department_wise?.Department.map((department, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}>
                                    <td className='place-row-data'>{department}</td>
                                    {placementData?.Department_wise?.years.map((year, cellIndex) => (
                                        <td key={cellIndex}>{placementData?.Department_wise?.[year]?.[rowIndex] || '-'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Year-wise PDF Reports */}
                <div className="placement-yearwise card">
                    <div className="place-syl-container">
                        <div className="place-syllabus-section">
                            <div className="place-syllabus-header">
                                <h3>Placement Details - Year Wise</h3>
                            </div>
                            <div className="place-syllabus-content">
                                <div className="place-Sylgrid">
                                {placementData?.Year_Wise?.year_pdf.map((year, index) => (  
                                  <button
                                      key={index}
                                      className="place-course-button"
                                      onClick={() => openModal(placementData?.Year_Wise?.Pdf_path[index])}
                                  >
                                      <div className="place-course">
                                          {year}
                                      </div>
                                  </button> 
                          ))}
                                </div>
                            </div>
                        </div>

                    {showModal && (
                        <div className="place-modal-overlay" onClick={closeModal}>
                            <div className="place-modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="place-close-button" onClick={closeModal}>X</button>
                                <iframe src={pdfLink} title="PDF Viewer" className="place-pdf-viewer"></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </div>

                {/* Placement Statistics */}
                <div className="placement-percent card">
                    <h4>Placement Statistics</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>PARTICULARS</th>
                                {placementData?.Statistics?.years?.map((year, index) => (
                                    <th key={index}>{year}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {placementData?.Statistics?.particulars.map((particular, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "even-row" : "odd-row"}>
                                    <td className='place-row-data'>{particular}</td>
                                    {placementData?.Statistics?.years.map((year, cellIndex) => (
                                        <td key={cellIndex}>{placementData?.Statistics?.[year]?.[rowIndex] || '-'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};
