import React, { useEffect, useState } from 'react';
import axios from "axios";
import './PlacementDetails.css';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';

export const PlacementDetails = ({ theme, toggle }) => {
    const [showModal, setShowModal] = useState(false);
    const [pdfLink, setPdfLink] = useState("");
    const [placementData, setPlacementData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
    
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

    return (
        <>
            <Banner
                theme={theme}
                toggle={toggle}
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                headerText="Placement Details"
                subHeaderText="Providing essential placement information and resources to guide students toward successful careers."
            />

            <div className="placement-wrapper">
                {isLoading ? (
                    <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
                        <LoadComp txt={""} />
                    </div>
                ) : (
                    <>
                        {/* Placement Department-wise Data */}
                        <div className="placement-percent card-plc">
                            <h4 className="section-title">Placement Details in % - Department Wise</h4>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="table-header">DEPARTMENT</th>
                                            {placementData?.Department_wise?.years?.map((year, index) => (
                                                <th className="table-header" key={index}>{year}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {placementData?.Department_wise?.Department.map((department, rowIndex) => (
                                            <tr key={rowIndex} className="table-row">
                                                <td className="">{department}</td>
                                                {placementData?.Department_wise?.years.map((year, cellIndex) => (
                                                    <td key={cellIndex}>{placementData?.Department_wise?.[year]?.[rowIndex] || '-'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Year-wise PDF Reports */}
                        <div className="placement-yearwise card-plc">
                            <h4 >Placement Details Year Wise</h4>
                            <div className="place-Sylgrid">
                                {placementData?.Year_Wise?.year_pdf.map((year, index) => (
                                    <button
                                        key={index}
                                        className="place-course-button"
                                        onClick={() => openModal(UrlParser(placementData?.Year_Wise?.Pdf_path[index]))}
                                    >
                                        <div className="place-course">{year}</div>
                                    </button>
                                ))}
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

                        {/* Placement Statistics */}
                        <div className="placement-percent card-plc">
                            <h4 className="section-title">Placement Statistics</h4>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="table-header">PARTICULARS</th>
                                            {placementData?.Statistics?.years?.map((year, index) => (
                                                <th className="table-header" key={index}>{year}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {placementData?.Statistics?.particulars.map((particular, rowIndex) => (
                                            <tr key={rowIndex} className="table-row">
                                                <td className="">{particular}</td>
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
                )}

            </div>
        </>
    );
};
