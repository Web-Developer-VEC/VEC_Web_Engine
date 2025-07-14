import React, { useState, useEffect } from 'react';
import './StudentHistory.css';
import { X, History, Download, Calendar, MapPin, FileText, LogOut, LogIn, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentHistory = () => {
  const [history, setHistory] = useState([]);
  const [selectedYear, setSelectedYear] = useState('Current');
  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentPasses = async () => {
      try {
        const response = await axios.get('/api/get_student_pass', { withCredentials: true });
        const passes = response.data.passes;

        if (passes.length === 0) {
          setHistory([]);
          setLoading(false);
          return;
        }

        const currentPasses = passes.filter(pass => pass.re_entry_time === null && (pass.wardern_approval !== false && pass.superior_wardern_approval !== false));
        const completedPasses = passes.filter(pass => pass.re_entry_time !== null);

        const groupedHistory = {};

        completedPasses.forEach(pass => {
          const monthYear = new Date(pass.request_date_time).toLocaleString('en-US', { month: 'long', year: 'numeric' });

          if (!groupedHistory[monthYear]) {
            groupedHistory[monthYear] = [];
          }
          groupedHistory[monthYear].push(pass);
        });

        const formattedHistory = [
          ...(currentPasses.length > 0 ? [{ year: "Current", data: currentPasses }] : []),
          ...Object.keys(groupedHistory).map(month => ({
            year: month,
            data: groupedHistory[month],
          })),
        ];

        setHistory(formattedHistory);
        setLoading(false);
      } catch (error) {
        // setError("Failed to fetch student passes.");
        setLoading(false);
      }
    };

    fetchStudentPasses();
  }, []);

  const handleCardClick = (data, year) => {
    if (year === "Current") {
      setSelectedData(data);
      setIsModalOpen(true);
      document.body.classList.add('blur-background');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
    document.body.classList.remove('blur-background');
  };

  const handleEditClick = (passid, event) => {
    event.stopPropagation();
    navigate('/hostel/student/request', { state: { passid } })
  }

  const downloadImage = (imageUrl, fileName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status, type) => {
    if (type === 'parent') {
      if (status === null) {
        return <span className="status pending"><Clock size={14} /> Pending</span>;
      } else if (status) {
        return <span className="status completed"><CheckCircle size={14} /> Approved</span>;
      } else {
        return <span className="status rejected"><AlertCircle size={14} /> Rejected</span>;
      }
    } else {
      if (status === null) {
        return <span className="status pending"><Clock size={14} /> Pending</span>;
      } else if (status) {
        return <span className="status completed"><CheckCircle size={14} /> Approved</span>;
      } else {
        return <span className="status rejected"><AlertCircle size={14} /> Rejected</span>;
      }
    }
  };

  const filteredHistory = selectedYear === 'Overall' ? history : history.filter(item => item.year === selectedYear);

  return (
    <div className="student-history-container">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="student-history-header flex items-center gap-2">
          <History className="history-icon" /> 
          Student History
        </h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="select-dropdown"
        >
          <option value="Current">Current Passes</option>
          <option value="Overall">All History</option>
          {history.filter(item => item.year !== "Current").map((item) => (
            <option key={item.year} value={item.year}>{item.year}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="loading-message">Loading student passes...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : history.length === 0 ? (
        <p className="no-data-message">No passes found. Create a new pass request to get started.</p>
      ) : (
        <div className="student-history-cards">
          {filteredHistory.map((val) => (
            <div key={val.year} className="mb-8">
              <h3 className="header">{val.year}</h3>
              <div className="space-y-4">
                {val.data.map((info, index) => (
                  <div
                    key={index}
                    className="student-history-card"
                    onClick={() => handleCardClick(info, val.year)}
                  >
                    <div className="one">
                      <div className="history-info">
                        <p className="text-secondary">
                          <strong className="text"><Calendar size={16} className="inline mr-1" /> Requested:</strong> {formatDate(info.request_date_time)}
                        </p>
                      </div>
                      <div className="history-info">
                        <p className="text-secondary">
                          <strong className="text"><MapPin size={16} className="inline mr-1" /> Destination:</strong> {info.place_to_visit}
                        </p>
                      </div>
                      <div className="history-info">
                          {info.reason_for_visit ? (
                              <p className="text-secondary">
                                <strong className="text"><FileText size={16} className="inline mr-1" /> Reason:</strong> {info.reason_for_visit}
                              </p>
                          ) : (
                            <p className="text-secondary">
                              <strong className="text"><FileText size={16} className="inline mr-1" /> Reason:</strong> {info.reason_type}
                            </p>
                          )}
                      </div>
                    </div>
                    <div className="two">
                      <div className="history-info in-out">
                        <p className="text-secondary">
                          <strong className="text"><LogOut size={16} className="inline mr-1" /> OUT:</strong> 
                          <span className="text-danger">{formatDate(info.from)}</span>
                        </p>
                        <p className="text-secondary">
                          <strong className="text"><LogIn size={16} className="inline mr-1" /> IN:</strong> 
                          <span className="text-success">{formatDate(info.to)}</span>
                        </p>
                      </div>
                      <div className="history-info approve-status">
                        <p className="text-secondary">
                          <strong className="text">Parent Status:</strong> {getStatusBadge(info.parent_approval, 'parent')}
                        </p>
                        {info.wardern_approval !== null ? (
                          <p className="text-secondary">
                            <strong className="text">Warden Status:</strong> {getStatusBadge(info.wardern_approval, 'warden')}
                          </p>
                        ) : info.superior_wardern_approval !== null ? (
                          <p className="text-secondary">
                            <strong className="text">Superior Warden Status:</strong> {getStatusBadge(info.superior_wardern_approval, 'superior')}
                          </p>
                        ) : (
                          <div className="stu-edit-container">
                            <button className='stu-edit-button' onClick={(e) => handleEditClick(info.pass_id, e)}>
                              <span>Edit Request</span>
                            </button>
                          </div>
                        )}
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="popup-x">
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-blue-800 mb-4">Pass Details</h2>
            <div className="details-row">
              <div className="details-column">
                <p>
                  <strong>Destination</strong>
                  {selectedData.place_to_visit}
                </p>
                {selectedData.reason_for_visit ? (
                  <p>
                    <strong>Reason</strong>
                    {selectedData.reason_for_visit}
                  </p>

                ) : (
                    <p>
                      <strong>Reason</strong>
                      {selectedData.reason_type}
                    </p>
                )}
                <p>
                  <strong>Out Date</strong>
                  {formatDate(selectedData.from)}
                </p>
                <p>
                  <strong>In Date</strong>
                  {formatDate(selectedData.to)}
                </p>
              </div>
              <div className="details-column">
                <p>
                  <strong>Status</strong>
                  <span className={`status ${selectedData.request_completed ? 'completed' : 'pending'}`}>
                    {selectedData.request_completed ? "Completed" : "Pending"}
                  </span>
                </p>
                <p>
                  <strong>Applied Date</strong>
                  {formatDate(selectedData.request_date_time)}
                </p>
                <p>
                  <strong>Pass Type</strong>
                  {selectedData.passtype}
                </p>
                <p>
                  <strong>Parent Approval</strong>
                  {getStatusBadge(selectedData.parent_approval, 'parent')}
                </p>
              </div>
            </div>
            
            {selectedData.file_path && (
            <div className="mt-4">
              <p className="font-semibold text-blue-800 mb-2">Supporting Document:</p>

              {selectedData.file_path && (
                (() => {
                  const fileUrl = UrlParser(selectedData.file_path);
                  const fileExtension = fileUrl.split('.').pop().toLowerCase();

                  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
                    return <img src={fileUrl} alt="Proof" className="modal-image" />;
                  } else if (fileExtension === 'pdf') {
                    return (
                      <iframe
                        src={fileUrl}
                        title="PDF Document"
                        className="w-full h-96 border"
                      >
                        This browser does not support PDFs. Please download the PDF to view it:
                        {/* <a href={fileUrl}>Download PDF</a> */}
                      </iframe>
                    );
                  } else {
                    return <p>Unsupported file format.</p>;
                  }
                })()
              )}
            </div>
            )}
            
            {selectedData.qrcode_path && (
              <div className="qr-container">
                <p>
                  <strong>Scan QR Code</strong>
                </p>
                <button 
                  onClick={() => downloadImage(selectedData.qrcode_path, `${selectedData.registration_number}_${selectedData.from.split('T')[0]}.png`)} 
                  className="download-icon"
                  title="Click to download QR code"
                >
                  <img src={UrlParser(selectedData.qrcode_path)} alt="QR Code" className="qr-image" />
                  <Download size={20} className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full" />
                </button>            
              </div>
            )}
            
            <button onClick={closeModal} className="modal-close-button">
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistory;