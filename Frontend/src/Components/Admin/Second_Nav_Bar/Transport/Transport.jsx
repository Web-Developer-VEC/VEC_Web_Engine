import React, { useEffect, useState } from "react";
import axios from "axios"; 
import Transportcarousel from "./Transportcarousel";
import PDF from "./PDF";
import Transportvideo from "./TransportVideo";
import LoadComp from '../../LoadComp'
import Toggle from "../../Toggle";
import { useNavigate } from "react-router";
import { ArrowDown, FileEdit, Send } from "lucide-react"; // icon
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminTransport = ({ theme, toggle }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [transportData, settransportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // for pdf replace
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [confirmPopup, setConfirmPopup] = useState(false);
    console.log(selectedPdf);
    

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
    
    useEffect(() => {
        const fetchData = async () => {
          try{
            const response = await axios.post('/api/main-backend/transport',
              { type: "transport" }
            ) 
            settransportData(response.data.data);
            setLoading(false);
          } catch (error) {
            console.error("Error fetching data:", error.message);
            if (error.response?.data?.status === 429) {
                navigate('/ratelimit', { state: { msg: error.response.data.message}})
            } 
            setLoading(false);
          }
        };
        
        fetchData();
    }, []);

    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

    // Handle file change
    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            setSelectedPdf({file, fileURL});
        }
    };
    
    const handleConfirmRequest = async () => {
        if (!selectedPdf) return;

        const oldPath = transportData[0]?.pdf_path;

        const newFilePath = `/static/pdfs/transport/${selectedPdf.file.name}`;

        const payload = [
            {
            collectionName: "transport",
            collection_type: "transport",
            action: "update",
            title: "Updation of transport Route pdf",
            category: null,
            meta_data: {
                pdf_path: newFilePath,
            },
            original_data: {
                pdf_path: oldPath,
            },
            },
        ];

        try {
            const formData = new FormData();
            formData.append("docs", JSON.stringify(payload));
            formData.append("files", selectedPdf.file);
            console.log(payload);
            

            const res = await axios.post(
                `/api/admin-backend/temp`,
                formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true, // if using cookies/auth
            }
            );

            toast.success(res.data.message || "Request submitted successfully!");
            setConfirmPopup(false);
            setSelectedPdf(null);
        } catch (error) {
            toast.error("Request not submitted successfully!");
            console.error("Error sending request", error);
        }
    };

    const oldpath = transportData[0]?.pdf_path
  ? transportData[0].pdf_path.split("/")
  : [];

    

    return (
        <div style={{ paddingBottom: "40px" }}>
            <div className="relative w-full h-[200px] overflow-hidden flex items-center justify-center md:h-[400px] h-[250px] font-[poppins]">
                <Transportvideo/>
                <Toggle toggle={toggle} theme={theme}
                    attr="absolute top-[10%] lg:top-[1%] left-[0.3%] lg:left-[0.3%] h-12 w-[11%] bg-[#0000001a] backdrop-blur-[4px]
                    rounded-br-xl"/>
                <div className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded font-[poppins]">
                    VEC Transport Facilities
                </div>
            </div>
            
            <div className="font-[poppins] flex flex-col items-center mt-6">
                {/* PDF Display */}
                { (selectedPdf || transportData?.[0]?.pdf_path) && (
                    <PDF pdfRoute={selectedPdf ? selectedPdf.fileURL : transportData[0].pdf_path} />
                )}

                {/* Replace PDF Button */}
                {!selectedPdf ? (
                    <div className="mt-4">
                        <label
                            htmlFor="pdf-upload"
                            className="cursor-pointer bg-yellow-400 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-2xl flex items-center gap-2"
                        >
                            <FileEdit size={18}/> Replace PDF
                        </label>
                        <input
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handlePdfChange}
                        />
                    </div>
                ) : (
                    <div className="p-6 flex justify-end">
                        <button className="p-[12px] bg-secd dark:drks cursor-pointer border rounded-[12px] flex gap-[10px] justify-center"
                                onClick={() => setConfirmPopup(true)}
                        ><Send/>Request</button>
                    </div>
                )}
            </div>
            
            {/* Styled Transport Facilities Paragraph */}
            <div className="transport-wrapper font-[poppins] flex justify-center items-center">
                <div className="border-l-4 border-secd dark:border-drks ml-2 md:m-0 rounded-md" style={{
                    maxWidth: "900px",
                    textAlign: "justify",
                    marginRight:"20px",
                    padding: "20px",
                    fontSize: "18px", 
                    lineHeight: "1.8", 
                    fontWeight: "400",
                    paddingLeft: "20px",
                }}>
                    <h2 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks inline-block font-bold text-[24px] mb-2 pb-1">
                        TRANSPORT FACILITIES
                    </h2>
                    <p>
                        Our college provides top-notch transport facilities with a fleet of renowned and brand-new buses, ensuring safe, comfortable, and efficient travel for students and staff.  
                        The buses are well-maintained, air-conditioned, and equipped with modern amenities. Covering multiple routes across the city and nearby areas, our transport system guarantees punctuality and convenience.  
                        With experienced drivers and regular maintenance checks, we prioritize the safety and ease of commuting for all.
                    </p>
                </div>
            </div>

            {/* Centered Carousel */}
            <div className="flex justify-center mt-10">
                <Transportcarousel items={transportData} loading={loading}/>
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />
            {confirmPopup && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
                    {/* Title */}
                    <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                    Final Request for the Changes
                    </h2>

                    {/* Note */}
                    <p className="text-sm text-red-500 mb-4">
                    Note: Your changes will stay pending until approved by the superior admin. 
                    Once approved, they will be applied automatically to the live site.
                    </p>

                    {/* Summary */}
                    <div className="max-h-[200px] overflow-y-auto mb-4">
                    <table className="w-full text-left text-text dark:text-drkt">
                        <thead>
                        <tr>
                            <th className="py-1">Action</th>
                            <th className="py-1">Section</th>
                            <th className="py-1 text-center">Changes</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="py-1 text-blue-600">✎ Edited</td>
                            <td className="py-1">Transport</td>
                            <td className="py-1 text-[12px] flex flex-col items-center">{oldpath[4]} <ArrowDown/> <a href={selectedPdf.fileURL} className="cursor-pointer" target="_blank">{selectedPdf.file.name}</a></td>
                        </tr>
                        </tbody>
                    </table>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setConfirmPopup(false)}
                        className="px-4 py-2 rounded bg-gray-400 text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmRequest}
                        className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
                    >
                        Final Request
                    </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default AdminTransport;