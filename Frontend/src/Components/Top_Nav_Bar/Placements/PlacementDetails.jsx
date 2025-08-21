import React, { useEffect, useState } from 'react';
import axios from "axios";
import './PlacementDetails.css';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';
import { useNavigate } from "react-router";

export const PlacementDetails = ({ theme, toggle }) => {
    const [showModal, setShowModal] = useState(false);
    const [pdfLink, setPdfLink] = useState("");
    const [placementData, setPlacementData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`/api/main-backend/placement`,
                    {
                        type: "placement_details"   
                    }
                );
                setPlacementData(response.data?.data || null);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error.message);
                 if (error.response.data.status === 429) {
                    navigate('/ratelimit', { state: { msg: error.response.data.message}})
                }
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
                backgroundImage="./Banners/placementbanner.webp"
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
                        {/* Year-wise PDF Reports */}
                        <div className="placement-yearwise font-[poppins] card-plc bg-prim dark:bg-drkts">
                            <h4 className='text-text bg-secd dark:drks'>Placement Details Year Wise</h4>
                            <div className="place-Sylgrid">
                                {placementData?.year_wise_pdfs?.map((year, index) => (
                                    <button
                                        key={index}
                                        className="place-course-button bg-secd dark:bg-drks text-text"
                                        onClick={() => openModal(UrlParser(year.pdf_path))}
                                    >
                                        <div className="place-course">{year.year}</div>
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

                            <div className='pt-8 ml-8  flex justify-start'>
                                ★ - Placement is still in progress 
                            </div>
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
                                    {placementData?.department_wise?.years?.map((yearObj, index) => (
                                        <th className="table-header" key={index}>
                                        {yearObj.year}
                                        </th>
                                    ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {placementData?.department_wise?.departments?.map((deptName, rowIndex) => (
                                    <tr key={rowIndex} className="table-row">
                                        <td className="text-text dark:text-drkt">{deptName}</td>
                                        {placementData?.department_wise?.years?.map((yearObj, colIndex) => (
                                        <td key={colIndex} className="text-center">
                                            {yearObj.values[rowIndex] !== "-" ? yearObj.values[rowIndex] : "-"}
                                        </td>
                                        ))}
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                            </div>


                        {/* Placement Statistics */}
                        <div className="placement-percent font-[poppins] card-plc">
                            <h4 className="place-section-title text-brwn dark:text-drkt">
                                Placement Statistics
                            </h4>
                            <div className="table-container">
                                <table>
                                <thead>
                                    <tr>
                                    <th className="table-header">PARTICULARS</th>
                                    {placementData?.statistics?.years?.map((yearObj, index) => (
                                        <th className="table-header" key={index}>
                                        {yearObj.year}
                                        </th>
                                    ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {placementData?.statistics?.particulars?.map((particular, rowIndex) => (
                                    <tr key={rowIndex} className="table-row">
                                        <td className="">{particular}</td>
                                        {placementData?.statistics?.years?.map((yearObj, colIndex) => (
                                        <td key={colIndex}>
                                            {yearObj.values[rowIndex] !== undefined
                                            ? yearObj.values[rowIndex]
                                            : "-"}
                                        </td>
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
