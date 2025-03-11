import React, { useEffect, useState } from 'react';
import { User, Printer, Download } from 'lucide-react';
import './Vacate.css';
import showSweetAlert from '../Alert';
import axios from 'axios';
import { data } from 'react-router-dom';

function Vacate() {
  const [phone_number_student, setMobileno] = useState('');
  const [studentData, setStudentData] = useState({});
  const [vacateData, setVacateData] = useState({
    date_time: '',
    Address: '',
    Reason: '',
  });
  const [isApproved, setIsApproved] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [vacateCount, setVacateCount] = useState(null);

  console.log(vacateCount);

  // Verify details from mobile number
  const handleVerify = async () => {
    if (!phone_number_student) {
      alert("Please enter a mobile number.");
      return;
    }

    try {
      const response = await fetch("/api/verify_student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone_number_student }),
      });

      const data = await response.json();

      if (response.ok) {
        setStudentData(data);
        showSweetAlert("Success!", "Student verified successfully.", "success");
      } else {
        setStudentData(null);
        showSweetAlert("Error!", "Student not found. Please check the mobile number", "error");
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      alert("Error verifying student. Try again.");
    }
  };

  const handleSuperiorRequest = async () => {

    try {
      const response = await axios.post('/api/submit_vacate_form',
        { student_id: studentData?.registration_number,
          Reason: vacateData?.Reason,
          Address: vacateData?.Address,
          date_time: vacateData?.date_time
        }
      );

      const data = response.data;
      

      if (response.status == 200) {
        setVacateCount(data.count);
        showSweetAlert("Submitted Successfully","Vacate Form Submitted.Superior Warden Notified","success");
      } else {
        showSweetAlert("Failed To Submite","Try again later","error");
      }

    } catch (error) {
      console.error("Error updating data");
      
    }
    // alert("Superior approval requested. Waiting for approval...");
    setTimeout(() => {
      setIsApproved(true);
    }, 2000);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
    }, 500);
    setTimeout(() => {
      setIsPrinting(false);
    }, 1000);
  };

  return (
    <div className={`v-container ${isPrinting ? 'print-mode' : ''}`}>
      {!isPrinting ? (
        <div className="v-main">
          <div className="v-content">
            <div className="v-card">
              {/* Show headings only if vacate_status is true */}
              {studentData?.vacate_status && (
                <>
                  <center>
                    <h2 className="v-title">VELAMMAL ENGINEERING COLLEGE</h2>
                  </center>
                  <h2 className="v-title">NO DUE FORM FOR VACATING HOSTEL</h2>
                </>
              )}

              <div className="v-section">
                <div className="v-mobile-verify">
                  <div className="v-input-group">
                    <label className="v-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="v-input"
                      placeholder="Enter your mobile number"
                      onChange={(e) => setMobileno(e.target.value)}
                      value={phone_number_student}
                    />
                  </div>
                  <button onClick={handleVerify} className="v-button HS-button-verify">
                    Verify
                  </button>
                </div>
              </div>

              {/* Show personal information only if vacate_status is true */}
              {studentData?.vacate_status && (
                <div className="v-section">
                  <h3 className="v-subtitle">Personal Information</h3>
                  <div className="v-grid">
                    <div className="v-input-group">
                      <label className="v-label">Name</label>
                      <input type="text" className="v-input" value={studentData?.name} readOnly />
                    </div>
                    <div className="v-input-group">
                      <label className="v-label">Department</label>
                      <input type="text" className="v-input" value={studentData?.department} readOnly />
                    </div>
                    <div className="v-input-group">
                      <label className="v-label">Hostel Block</label>
                      <input type="text" className="v-input" value={studentData?.block_name} readOnly />
                    </div>
                    <div className="v-input-group">
                      <label className="v-label">Hostel Room No</label>
                      <input type="text" className="v-input" value={studentData?.room_number} readOnly />
                    </div>
                    <div className="v-input-group">
                      <label className="v-label">Year</label>
                      <input type="text" className="v-input" value={studentData?.year} readOnly />
                    </div>
                    <div className="v-input-group">
                      <label className="v-label">Date & Time of Vacating</label>
                      <input
                        type="datetime-local"
                        className="v-input"
                        onChange={(e) => setVacateData({ ...vacateData, date_time: e.target.value })}
                      />
                    </div>
                    <div className="v-input-group">
                      <label className="v-label">Address With Mobile Number (Parent/Spouse)</label>
                      <textarea
                        type="text"
                        className="v-input"
                        onChange={(e) => setVacateData({ ...vacateData, Address: e.target.value })}
                      />
                    </div>
                    <div className="v-input-group">
                      <label className="v-label">Reason For Vacating</label>
                      <input
                        type="text"
                        className="v-input"
                        onChange={(e) => setVacateData({ ...vacateData, Reason: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
<div className="print-form">
  <h2>VELAMMAL ENGINEERING COLLEGE</h2>
  <h3>NO DUE FORM FOR VACATING HOSTEL</h3>

  <table>
    <tbody>
      <tr>
        <td>Name</td>
        <td>{studentData.name}</td>
      </tr>
      <tr>
        <td>Department</td>
        <td>{studentData.department}</td>
      </tr>
      <tr>
        <td>Hostel Block</td>
        <td>{studentData.block_name}</td>
      </tr>
      <tr>
        <td>Hostel Room No</td>
        <td>{studentData.room_number}</td>
      </tr>
      <tr>
        <td>Year & Department</td>
        <td>{studentData.year}</td>
      </tr>
      <tr>
        <td>Date & Time of Vacating</td>
        <td>{vacateData.date_time}</td>
      </tr>
      <tr>
        <td>Parent/Spouse Address</td>
        <td>{vacateData.Address}</td>
      </tr>
      <tr>
        <td>Reason for Vacating</td>
        <td>{vacateData.Reason}</td>
      </tr>
    </tbody>
  </table>

  <div className="signatures">
    <p>Mess Manager Sign</p>
    <p>Dy. Chief Warden's Sign</p>
    <p>Joint Warden Sign</p>
  </div>
  <div className="form-count">
        <p>Form No:HS{vacateCount}</p>
  </div>
</div>

      )}

      {/* Show actions (Superior Request and Print) only if vacate_status is true */}
      {studentData?.vacate_status && (
        <div className="v-section v-actions-centered">
          {!isApproved ? (
            <button className="v-button v-button-parent" onClick={handleSuperiorRequest}>
              Superior Request
            </button>
          ) : (
            <button className="v-button v-button-parent print" onClick={handlePrint}>
              <Printer size={20} /> Print
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Vacate;