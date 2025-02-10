import React, { useState } from 'react';
import './StudentHistory.css';
import { X, History } from 'lucide-react';

const StudentHistory = () => {
  const history = [
    {
      year: "Current",
      data: [
        {
          placeToVisit: "Chennai",
          Reason: "Festival",
          outDate: "05-07-2025",
          inDate: "07-07-2025",
          status: "Parent Accepted",
          applied_date: "01-07-2025",
          passType: 'Outpass',
          proof: '../Assets/30_ yearold_man_acting_like_college.png',
          qrImage: 'Frontend/public/static/Images/NET.jpg',
        },
      ],
    },
    {
      year: "Dec 2024",
      data: [
        {
          placeToVisit: "Chennai",
          Reason: "Festival",
          outDate: "21-12-2024",
          inDate: "23-12-2025",
          status: "Arrived",
          applied_date: "01-07-2025",
          passType: 'Outpass',
          proof: 'kumar',
          qrImage: 'kumar',
        },
        {
          placeToVisit: "Chennai",
          Reason: "Festival",
          outDate: "19-12-2024",
          inDate: "20-12-2025",
          status: "Arrived",
          applied_date: "01-07-2025",
          passType: 'Outpass',
          proof: 'kumar',
          qrImage: 'kumar',
        },
      ],
    },
    {
      year: "Nov 2024",
      data: [
        {
          placeToVisit: "Chennai",
          Reason: "Festival",
          outDate: "21-11-2024",
          inDate: "23-11-2025",
          status: "Arrived",
          applied_date: "01-07-2025",
          passType: 'Outpass',
          proof: 'kumar',
          qrImage: 'kumar',
        },
      ],
    },
    {
      year: "June 2024",
      data: [
        {
          placeToVisit: "Chennai",
          Reason: "Festival",
          outDate: "21-12-2024",
          inDate: "23-12-2025",
          status: "Arrived",
          applied_date: "01-07-2025",
          passType: 'Outpass',
          proof: 'kumar',
          qrImage: 'kumar',
        },
        {
          placeToVisit: "Chennai",
          Reason: "Festival",
          outDate: "19-12-2024",
          inDate: "20-12-2025",
          status: "Arrived",
          applied_date: "01-07-2025",
          passType: 'Outpass',
          proof: 'kumar',
          qrImage: 'kumar',
        },
      ],
    },
  ];

  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedData, setSelectedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const filteredHistory = selectedYear === 'all' 
    ? history 
    : history.filter(item => item.year === selectedYear);

  const handleCardClick = (data) => {
    setSelectedData(data);
    setIsModalOpen(true);
    document.body.classList.add('blur-background');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
    document.body.classList.remove('blur-background');
  };

  return (
    <div className="student-history-container card m-6 p-15">
      <div className="mb-8 flex justify-between">
        <h1 className="student-history-header flex items-center gap-2">
          <History className="history-icon" /> 
          Student History
        </h1>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="select-dropdown"
        >
          <option value="all">All Years</option>
          {history.map(item => (
            <option key={item.year} value={item.year}>
              {item.year}
            </option>
          ))}
        </select>
      </div>

      <div className="student-history-cards">
        {filteredHistory.map((val, index) => (
          <div key={val.year} className="mb-8">
            <h2 className="text-primary">{val.year}</h2>
            <div className="space-y-4">
              {val.data.map((info, infoIndex) => (
                <div
                  key={infoIndex}
                  className={`student-history-card ${
                    val.year === "Current" 
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-shadow" 
                      : "not-current bg-gradient-to-r from-gray-50 to-gray-100"
                  }`}
                  onClick={() => {
                    val.year === "Current" && handleCardClick(info)
                  }}
                >
                  <div className="history-info">
                    <p className="text-secondary">
                      <strong className="text-primary">Requested Date:</strong> {info.applied_date}
                    </p>
                  </div>
                  <div className="history-info">
                    <p className="text-secondary">
                      <strong className="text-primary">Visiting To:</strong> {info.placeToVisit}
                    </p>
                  </div>
                  <div className="history-info">
                    <p className="text-secondary">
                      <strong className="text-primary">Reason:</strong> {info.Reason}
                    </p>
                  </div>
                  <div className="history-info">
                    <p className="text-secondary">
                      <strong className="text-primary">OUT Date:</strong>{" "}
                      <span className="text-danger">{info.outDate}</span>
                    </p>
                    <p className="text-secondary">
                      <strong className="text-primary">IN Date:</strong>{" "}
                      <span className="text-success">{info.inDate}</span>
                    </p>
                  </div>
                  <div className="history-info">
                    <p className="text-secondary">
                      <strong className="text-primary">Status:</strong> {info.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="popup-x">
              <X />
            </button>
            <h2 className="text-primary">Details</h2>
            <div className="details-row">
              <div className="details-column">
                <p><strong>Place to Visit:</strong> {selectedData.placeToVisit}</p>
                <p><strong>Reason:</strong> {selectedData.Reason}</p>
                <p><strong>Out Date:</strong> {selectedData.outDate}</p>
                <p><strong>In Date:</strong> {selectedData.inDate}</p>
              </div>
              <div className="details-column">
                <p><strong>Status:</strong> 
                  <span className={`status ${selectedData.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedData.status}
                  </span>
                </p>
                <p><strong>Applied Date:</strong> {selectedData.applied_date}</p>
                <p><strong>Pass Type:</strong> {selectedData.passType}</p>
              </div>
            </div>
            <div className="flex justify-around">
              <p><strong>Proof:</strong> <img src={`${selectedData.proof}`} alt="Proof" className="modal-image" /></p>
              <p><strong>Scan ME:</strong> <img src={selectedData.qrImage} alt="QR Code" className="modal-image" /></p>
            </div>
            <button onClick={closeModal} className="modal-close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistory;