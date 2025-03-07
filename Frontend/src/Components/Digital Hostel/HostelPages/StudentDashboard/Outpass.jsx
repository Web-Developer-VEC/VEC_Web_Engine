import React, { useEffect, useState } from 'react';
import { User, FileText, Clock, CheckCircle2 } from 'lucide-react';
import './Outpass.css';
import showSweetAlert from "../Alert";
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function HostelPass() {
  const [verified, setVerified] = useState(false);
  const [passType, setPassType] = useState('');
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [reasonType, setReasonType] = useState('');
  const [phone_number_student, setMobileno] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [place, setPlace] = useState(null);
  const [reason, setReason] = useState(null);
  const [existingFilePath, setExistingFilePath] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const location = useLocation();
  let passid  = location.state?.passid

  const navigate = useNavigate();

  const ReasonTypeMapping =  { od : [ 'Internship','Symposium','Hackathon','Sports','Others'], leave : ['Function','Medical','Exams','Emergency','Ohers'], outpass :['Shopping','Classes','Internship','Medical','Others'], staypass: ['Holiday','Weekend Holiday','Semester Holiday','Festival Holiday','Others']}

  const handleFileChange = (event) => {
    const file = event.target.files ? event.target.files[0] : event.dataTransfer.files[0];

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("❌ File size exceeds 10MB limit.");
        return;
      }

      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file)); // Generate preview link
    }
  };

  const handlePassTypeChange = (type) => {
    setPassType(type);
    setShowDocUpload(type === 'od' || type === 'leave');
  };

  const validateTime = (dateTime, gender) => {
    const selectedTime = new Date(dateTime);
    const selectedHour = selectedTime.getHours();
    const selectedMinutes = selectedTime.getMinutes();
  
    if (gender === "Female" && (selectedHour > 18 || (selectedHour === 18 && selectedMinutes > 0)) && passType === 'outpass') {
      alert("Girls are not allowed to select a time after 6:00 PM.");
      return false;
    } else if (gender === "Male" && (selectedHour > 21 || (selectedHour === 21 && selectedMinutes > 0)) && passType === 'outpass') {
      alert("Boys are not allowed to select a time after 9:00 PM.");
      return false;
    }
    return true;
  };

  const handleFromChange = (e) => {
    const selectedDateTime = e.target.value;
    if (validateTime(selectedDateTime, studentData?.gender)) {
      setFrom(selectedDateTime);
    }
  };

  const handleToChange = (e) => {
    const selectedDateTime = e.target.value;
    if (validateTime(selectedDateTime, studentData?.gender)) {
      setTo(selectedDateTime);
    } else {
      setTo(""); 
    }
  };

  // Fetch pass details if passid is present
  useEffect(() => {
    if (passid) {
      fetchPassDetails();
      setIsEditMode(true); // Enable edit mode
    }
  }, [passid]);

  // Fetch pass details
  const fetchPassDetails = async () => {
    try {
      const response = await fetch("/api/get_student_pass_by_passid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ pass_id: passid }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update form state with fetched data
        setPassType(data.passtype);
        setShowDocUpload(data.passtype === "od" || data.passtype === "leave");
        setReasonType(data.reason_type);
        setFrom(data.from.split("T")[0] + "T" + data.from.split("T")[1].slice(0, 5));
        setTo(data.to.split("T")[0] + "T" + data.to.split("T")[1].slice(0, 5))
        setPlace(data.place_to_visit);
        setReason(data.reason_for_visit);
        setExistingFilePath(data.file_path || "");
        setMobileno(data.mobile_number);

        // Fetch student data for verification
        const studentResponse = await fetch("/api/verify_student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ phone_number_student: data.mobile_number }),
        });

        const studentData = await studentResponse.json();

        if (studentResponse.ok) {
          setStudentData(studentData);
          setVerified(true);
        } else {
          showSweetAlert("Error!", "Student not found. Please check the mobile number", "error");
        }
      } else {
        showSweetAlert("Error!", data.error || "Failed to fetch pass details", "error");
      }
    } catch (error) {
      console.error("Error fetching pass details:", error);
      showSweetAlert("Error!", "Something went wrong. Please try again.", "error");
    }
  };

// Handle update pass
const handleUpdatePass = async () => {
  if (!phone_number_student) {
    alert("Please verify your mobile number first.");
    return;
  }

  const formData = new FormData();
  formData.append("pass_id", passid);
  formData.append("passtype", passType);
  formData.append("from", from);
  formData.append("to", to);
  formData.append("place_to_visit", place);
  formData.append("reason_type", reasonType);
  formData.append("reason_for_visit", reason || "");

  if (selectedFile) {
    formData.append("file", selectedFile);
  }

  try {
    const response = await fetch("/api/edit_student_pass", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setPassType("");
      setShowDocUpload(false);
      setReasonType("");
      setFrom("");
      setTo("");
      setPlace("");
      setReason("");
      setSelectedFile(null);
      setPreviewURL(null);
      setExistingFilePath("");
      setMobileno("");

      setStudentData(null);

      setVerified(false);

      setIsEditMode(false);
      if (location.state?.passid) {
        location.state.passid = null;
      }

              Swal.fire({
                title: "Successful",
                text: `✅ Pass updated successfully!`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                willClose: () => {
                  Swal.close();
                  navigate('/hostel/student/previousrequest');
                },
              });
    } else {
      showSweetAlert("Error!", data.error || "Failed to update pass", "error");
    }
  } catch (error) {
    console.error("Error updating pass:", error);
    showSweetAlert("Error!", "Something went wrong. Please try again.", "error");
  }
};

  //verify details from mobile number
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
        setVerified(true);
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

  //send data for parent request
  const handleParentApproval = async () => {
    if (!phone_number_student) {
      alert("Please verify your mobile number first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("mobile_number", phone_number_student);
    formData.append("name", studentData?.name);
    formData.append("department_name", studentData?.department);
    formData.append("year", studentData?.year);
    formData.append("room_no", studentData?.room_number);
    formData.append("registration_number", studentData?.registration_number);
    formData.append("block_name", studentData?.block_name);
    formData.append("pass_type", passType);
    formData.append("from", from);
    formData.append("to", to);
    formData.append("place_to_visit", place);
    formData.append("reason_type", reasonType);
    formData.append("reason_for_visit", reason || "");
  
    if (selectedFile) {
      formData.append("file", selectedFile);  // Attach the file
    }
  
    try {
      const response = await fetch("/api/submit_pass_parent_approval", {
        method: "POST",
        credentials: "include", 
        body: formData
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showSweetAlert("Success!", "✅ Pass request submitted. Parent approval SMS sent!", "success");
      } else {
        showSweetAlert("Error!", `${data.error}`, "error");
      }
    } catch (error) {
      showSweetAlert("Error!", `Something went wrong! Please try again.`, "error");
    }
  };

  //Warden approval
  const handleWardenApproval = async () => {
    if (!phone_number_student) {
      alert("Please verify your mobile number first.");
      return;
    }
  
    const formData = new FormData();
  
    // Prepare the pass data
    formData.append("mobile_number", phone_number_student);
    formData.append("name", studentData?.name);
    formData.append("department_name", studentData?.department);
    formData.append("year", studentData?.year);
    formData.append("room_no", studentData?.room_number);
    formData.append("registration_number", studentData?.registration_number);
    formData.append("block_name", studentData?.block_name);
    formData.append("pass_type", passType);
    formData.append("from", from);
    formData.append("to", to);
    formData.append("place_to_visit", place);
    formData.append("reason_type", reasonType);
    formData.append("reason_for_visit", reason || "");  // Ensure reason is never undefined
    formData.append("notify_superior", false);
  
    // Append the file if it's selected
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
  
    try {
      const response = await fetch("/api/submit_pass_warden_approval", {
        method: "POST",
        credentials: "include",
        body: formData,  // Send the FormData directly
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showSweetAlert("Success!", "✅ Pass request submitted. Warden notified!", "success");
      } else {
        showSweetAlert("❌ Error:", `❌ Error: ${data.error}`, "error");
      }
    } catch (error) {
      showSweetAlert("Error!", `Something went wrong! Please try again.`, "error");
    }
    
  };

  //superior warden approval
  const handleSuperiorWardenApproval = async () => {
    if (!phone_number_student) {
      alert("Please verify your mobile number first.");
      return;
    }
  
    const formData = new FormData();
  
    // Prepare the pass data
    formData.append("mobile_number", phone_number_student);
    formData.append("name", studentData?.name);
    formData.append("department_name", studentData?.department);
    formData.append("year", studentData?.year);
    formData.append("room_no", studentData?.room_number);
    formData.append("registration_number", studentData?.registration_number);
    formData.append("block_name", studentData?.block_name);
    formData.append("pass_type", passType);
    formData.append("from", from);
    formData.append("to", to);
    formData.append("place_to_visit", place);
    formData.append("reason_type", reasonType);
    formData.append("reason_for_visit", reason || "");  // Ensure reason is never undefined
    formData.append("notify_superior", true); 
  
    // Append the file if it's selected
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
  
    try {
      const response = await fetch("/api/submit_pass_warden_approval_superior", {
        method: "POST",
        credentials: "include",
        body: formData,  // Send the FormData directly
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showSweetAlert("Success!", "✅ Pass request submitted. superior Warden notified!", "success");
      } else {
        showSweetAlert("❌ Error:", `❌ Error: ${data.error}`, "error");
      }
    } catch (error) {
      showSweetAlert("Error!", `Something went wrong! Please try again.`, "error");
    }
    
  };
  
  //save draft
  const handleSaveDraft = async () => {
    if (!phone_number_student) {
      alert("Please verify your mobile number first.");
      return;
    }
  
    const formData = new FormData();
  
    // Prepare the pass data
    formData.append("mobile_number", phone_number_student);
    formData.append("name", studentData?.name);
    formData.append("department_name", studentData?.department);
    formData.append("year", studentData?.year);
    formData.append("room_no", studentData?.room_number);
    formData.append("registration_number", studentData?.registration_number);
    formData.append("block_name", studentData?.block_name);
    formData.append("pass_type", passType);
    formData.append("from", from);
    formData.append("to", to);
    formData.append("place_to_visit", place);
    formData.append("reason_type", reasonType);
    formData.append("reason_for_visit", reason || "");  // Ensure reason is never undefined
  
    // Append the file if it's selected
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const response = await fetch("/api/save_draft", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showSweetAlert('Success', "✅ Pass Saved as Draft", 'success')
      } else {
        showSweetAlert("Error!",`❌ Error: ${data.error}`,"error")
      }
    } catch (error) {
      showSweetAlert("Error!", `Something went wrong! Please try again.`, "error");
    }
    window.location.reload();
  };

  //fetch Draft data
  const fetchDrafts = async () => {
    try {
      const response = await fetch("/api/fetch_drafts", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      console.log("Fetched Drafts:", data);

      if (response.ok && data.drafts.length > 0) {
        const firstDraft = data.drafts[0];

        setPassType(firstDraft.passtype);
        setShowDocUpload(firstDraft.passtype === "od" || firstDraft.passtype === "leave");
        setReasonType(firstDraft.reason_type);
        setMobileno(firstDraft.mobile_number);
        setStudentData({
          name: firstDraft.name,
          department: firstDraft.dept,
          year: firstDraft.year,
          room_number: firstDraft.room_no,
          registration_number: firstDraft.registration_number,
          block_name: firstDraft.blockname,
        });

        // Set Place to Visit and Reason for Visit correctly
        setReasonType(firstDraft.reason_type);
        setFrom(firstDraft.from.split("T")[0] + "T" + firstDraft.from.split("T")[1].slice(0, 5));
        setTo(firstDraft.to.split("T")[0] + "T" + firstDraft.to.split("T")[1].slice(0, 5))
        setPlace(firstDraft.place_to_visit || "");
        setReason(firstDraft.reason_for_visit || "")

        if (firstDraft.file_path) {
          setExistingFilePath(firstDraft.file_path); 
          setSelectedFile(null); 
        } else {
          setExistingFilePath("");
        }

      } else {
        showSweetAlert("Oops..!","No drafts found.", "info");
      }
    } catch (error) {
      showSweetAlert("Error","❌ Error fetching drafts:","error");
    }
  };


   
  return (
    <div className="HS-container">
      <div className="HS-main">
        <div className="HS-content">
          <div className="HS-card">
            <h2 className="HS-title">Outpass / Stay Pass Application</h2>

            {/* Mobile Verification */}
            <div className="HS-section">
              <div className="HS-mobile-verify">
                <div className="HS-input-group">
                  <label className="HS-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="HS-input"
                    placeholder="Enter your mobile number"
                    onChange={(e) => setMobileno(e.target.value)}
                    value={phone_number_student}
                  />
                </div>
                    <button
                    onClick={() => handleVerify()}
                    className="HS-button HS-button-verify"
                    >
                    Verify
                    </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="HS-section">
              <h3 className="HS-subtitle">
                <User size={20} />
                Personal Information
              </h3>
              <div className="HS-grid">
                <div className="HS-input-group">
                  <label className="HS-label">Name</label>
                  <input type="text" className="HS-input" value={studentData?.name} />
                </div>
                <div className="HS-input-group">
                  <label className="HS-label">Admission Number</label>
                  <input type="text" className="HS-input" value={studentData?.registration_number} />
                </div>
                <div className="HS-input-group">
                  <label className="HS-label">Department Name</label>
                  <input type="text" className="HS-input" value={studentData?.department} />
                </div>
                <div className="HS-input-group">
                  <label className="HS-label">Year</label>
                  <input type="number" className="HS-input" value={studentData?.year}/>
                </div>
                <div className="HS-input-group">
                  <label className="HS-label">Room Number</label>
                  <input type="text" className="HS-input" value={studentData?.room_number}/>
                </div>
                <div className="HS-input-group">
                  <label className="HS-label">Block Name</label>
                  <input type="text" className="HS-input" value={studentData?.block_name}/>
                </div>
              </div>
            </div>

            {/* Pass Type */}
            <div className="HS-section">
              <h3 className="HS-subtitle">
                <FileText size={20} />
                Pass Type
              </h3>
              <div className="HS-pass-types">
                {['outpass', 'staypass', 'od', 'leave'].map((type) => (
                  <label
                    key={type}
                    className={`HS-pass-type ${passType === type ? 'HS-pass-type-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="passType"
                      value={type}
                      className="HS-radio"
                      onChange={() => handlePassTypeChange(type)}
                    />
                    <span className="HS-pass-label">{type}</span>
                    {passType === type && (
                      <CheckCircle2 className="HS-check-icon" size={20} />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Document Upload Section */}
            {showDocUpload && (
              <div className="HS-section HS-animate-expand">
                <h3 className="HS-subtitle">📂 Document Upload</h3>

                <div
                  className="HS-upload-box"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e);
                  }}
                >
                  <input
                    type="file"
                    className="HS-file-input"
                    id="document-upload"
                    onChange={handleFileChange}
                    accept=".pdf, .doc, .docx, .jpg, .jpeg, .png"
                  />

                  <label htmlFor="document-upload" className="HS-upload-label">
                    Click to upload or drag and drop
                  </label>
                  <br />
                  {existingFilePath && !selectedFile ? (
                    <a
                      href={existingFilePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="HS-upload-success"
                    >
                      📄 View previously uploaded file
                    </a>
                  ) : null}
                  {selectedFile ? (
                    <a
                      href={previewURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="HS-upload-success"
                    >
                      📄 {selectedFile.name} uploaded successfully!
                    </a>
                  ) : null}
                  {!existingFilePath && !selectedFile && (
                    <p className="HS-upload-hint">PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB</p>
                  )}
                </div>
              </div>
            )}
            {/* Pass Details */}
            {passType && (
              <div className="HS-section HS-animate-expand">
                <h3 className="HS-subtitle">
                  <Clock size={20} />
                  Pass Details
                </h3>
                <div className="HS-grid">
                  <div className="HS-input-group">
                    <label className="HS-label">From Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="HS-input" 
                      id='fromDateTime' 
                      value={from} 
                      onChange={handleFromChange}
                    />
                  </div>
                  <div className="HS-input-group">
                    <label className="HS-label">To Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="HS-input" 
                      id='toDateTime' 
                      value={to} 
                      onChange={handleToChange}
                    />
                  </div>
                  <div className="HS-input-group">
                    <label className="HS-label">Place of Visit</label>
                    <input type="text" className="HS-input"  id='placeOfVisit' value={place} onChange={(e)=> setPlace(e.target.value)} />
                  </div>
                  <div className="HS-input-group">
                    <label className="HS-label">Reason Type</label>
                    <select 
                      className="HS-select"
                      value={reasonType}
                      onChange={(e) => setReasonType(e.target.value)}
                    >
                      <option value="">Select Reason Type</option>
                      {ReasonTypeMapping[passType]?.map((type)=>(
                        <option value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {reasonType === 'Others' && (
                    <div className="HS-input-group HS-full-width">
                      <label className="HS-label">Reason for Visit</label>
                      <textarea rows={3} className="HS-textarea" id='reasonForVisit' value={reason} onChange={(e)=> setReason(e.target.value)}/>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {passType && (
              <div className="HS-actions HS-animate-expand">
                {isEditMode ? (
                  <button className="HS-button HS-button-update" onClick={handleUpdatePass}>
                    Update Pass
                  </button>
                ) : (
                  <>
                    {/* <button className="HS-button HS-button-parent" onClick={handleParentApproval}> 
                      Parent Approval
                    </button> */}
                    <button className="HS-button HS-button-warden" onClick={handleWardenApproval}>
                      Warden Approval
                    </button>
                    <button className="HS-button HS-button-chief" onClick={handleSuperiorWardenApproval}>
                      Chief Warden Approval
                    </button>
                    <button className="HS-button HS-button-save" onClick={handleSaveDraft}>
                      Save
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Draft Button */}
            {!isEditMode && (
              <div className="HS-Draft-Button">
                <button className="HS-button HS-button-draft" onClick={fetchDrafts}>
                  <FileText size={20} />View Draft
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostelPass;