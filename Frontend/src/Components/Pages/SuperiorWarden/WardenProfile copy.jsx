import React, { useState } from "react";
import "./WardenProfile.css";
import HostelSidebar from "../HostelStudents/HostelSidebar";
import { Mail, Lock, User, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { UserRoundPen } from 'lucide-react';

const WardenProfile = () => {
    const [wardens, setWardens] = useState([
        {
            name: "Kumar",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQulWyOFEAaGQCDWw1BWsk5rwSerOU_hyusyA&s",
            wardenFor: "3rd Year",
            in_charge: "Boys",
            date: "05-07-2015",
            isActive: true,
            primaryWarden: [3, 4],
            seconadryWarden: [1, 2],
        },
        {
            name: "mohan",
            img: "data:image/jpeg;base64,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",
            wardenFor: "2nd Year",
            in_charge: "Boys",
            date: "12-09-2018",
            isActive: false,
            primaryWarden: [2, 1],
            seconadryWarden: [4, 3],
        },
        {
            name: "jaya balan",
            img: "data:image/jpeg;base64,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",
            wardenFor: "2nd Year",
            in_charge: "Boys",
            date: "12-09-2018",
            isActive: false,
            primaryWarden: [2, 1],
            seconadryWarden: [4, 3],
        },
        {
            name: "swathi",
            img: "https://previews.123rf.com/images/shojihori/shojihori2003/shojihori200300083/143378042-the-appearance-of-a-beautiful-japanese-woman.jpg",
            wardenFor: "2nd Year",
            in_charge: "Girls",
            date: "12-09-2018",
            isActive: false,
            primaryWarden: [2, 1],
            seconadryWarden: [4, 3],
        },
        {
            name: "hema",
            img: "https://c8.alamy.com/comp/2RTB2JK/young-japanese-woman-portrait-2RTB2JK.jpg",
            wardenFor: "2nd Year",
            in_charge: "Girls",
            date: "12-09-2018",
            isActive: false,
            primaryWarden: [2, 1],
            seconadryWarden: [4, 3],
        },
    ]);


    const [selectedWarden, setSelectedWarden] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingToggleIndex, setPendingToggleIndex] = useState(null);
    const [edit, setEdit] = useState('');

    const toggleStatus = (index) => {
        const updatedWardens = [...wardens];
        updatedWardens[index] = { ...updatedWardens[index], isActive: !updatedWardens[index].isActive };
        setWardens(updatedWardens);
        setConfirmModalOpen(false); // Close confirmation popup after updating status
        console.log(updatedWardens);
    };

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("warden-form");
      
        // Function to update live preview data
        function updateLiveData() {
          document.getElementById("data-name").textContent = document.getElementById("warden-name").value || "-";
          document.getElementById("data-role").textContent = document.getElementById("warden-role").value || "-";
          document.getElementById("data-email").textContent = document.getElementById("warden-email").value || "-";
          document.getElementById("data-phone").textContent = document.getElementById("warden-phone").value || "-";
          document.getElementById("data-gender").textContent = document.getElementById("warden-gender").value || "-";
        }
      
        // Add event listeners to update live data when input fields change
        form.addEventListener("input", updateLiveData);
      });
      

    const openModal = (event, warden) => {
        if (!event.target.closest('.switch-and-button')) {
            console.log('kumar');
            setEdit('on')
            setSelectedWarden(warden);
            setIsModalOpen(true);
        }
    };

    const handleEdit = () => {
        setEdit('on');
    }

    const handleEditclose = () => {
        setEdit('off');
    }

    const closeModal = () => {
        setEdit('');
        const modal = document.querySelector('.modal-overlay');
        console.log('Modal Element:', modal); // Debugging: Check if the modal exists
        if (modal) {
            setIsModalOpen(false);
            setSelectedWarden(null);
        } else {
            console.error('Modal element not found!'); // Debugging: Log an if the modal doesn't exist
        }
    };

    const openConfirmModal = (event, index) => {
        event.stopPropagation(); // Prevent the card click event
        setPendingToggleIndex(index);
        setConfirmModalOpen(true);
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
      });
      const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: ''
      });
      const [submitted, setSubmitted] = useState(false);
    
      const handleSubmit = (e) => {
        e.preventDefault();
        let hasErrors = false;
        const newErrors = { name: '', email: '', password: '' };
    
        if (!formData.name) {
          newErrors.name = 'Name is required';
          hasErrors = true;
        }
    
        if (!formData.email) {
          newErrors.email = 'Email is required';
          hasErrors = true;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
          hasErrors = true;
        }
    
        if (!formData.password) {
          newErrors.password = 'Password is required';
          hasErrors = true;
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
          hasErrors = true;
        }
    
        setErrors(newErrors);
    
        if (!hasErrors) {
          setSubmitted(true);
          // Handle form submission here
        }
      };
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
      };
    

    return (
        <div className="flex">
            <HostelSidebar />
            <div className="flex-1 card m-4 flex flex-col justify-center items-center p-5 w-full superior-wardens-profile">
                {wardens.map((warden, index) => (
                    <div
                        onClick={(event) => openModal(event, warden)}
                        key={index}
                        className={`glass-card w-full max-w-5xl h-full max-h-[600px] flex items-center justify-around mb-4 ${warden.in_charge.toLowerCase()}`}
                    >
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0 border-r-4 rounded-lg">
                                <img src={warden.img} alt="Warden" className="warden-img rounded-lg" />
                            </div>
                            <div className="ml-8 flex-1">
                                <h2 className="warden-title">{warden.name}</h2>
                                <p className="warden-text">
                                    <span className="highlight">Warden For:</span> {warden.wardenFor}
                                </p>
                                <p className="warden-text">
                                    <span className="highlight">In Charge:</span> {warden.in_charge}
                                </p>
                                <p className="warden-text">
                                    <span className="highlight">Date:</span> {warden.date}
                                </p>
                            </div>

                            <div className="switch-and-button">
                                <div className="toggle-border">
                                    <input
                                        type="checkbox"
                                        id={`toggle-${index}`}
                                        checked={warden.isActive}
                                        onChange={(event) => {
                                            event.stopPropagation();
                                            openConfirmModal(event, index);
                                        }}
                                    />
                                    <label htmlFor={`toggle-${index} handle-label`}>
                                        <div className="handle"></div>
                                    </label>
                                </div>
                            </div>

                            {/* <div className="switch-and-button" onClick={(e) => e.stopPropagation()}>
                                <div className="toggle-border">
                                    <div className="status-text">
                                        {warden.isActive ? "Active" : "Inactive"}
                                    </div>
                                    <input
                                        type="checkbox"
                                        id={`toggle-${index}`}
                                        checked={warden.isActive}
                                        onChange={(e) => openConfirmModal(e, index)}
                                    />
                                    <label htmlFor={`toggle-${index}`}>
                                        <div className="handle"></div>
                                    </label>
                                </div>
                            </div> */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Warden Details Modal */}
            {isModalOpen && selectedWarden && (
                <div className="modal-overlay" onClick={closeModal}> 
                { edit === 'off' ? (
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-row justify-around items-center close-modal-btn">
                            <button className="editbtn" onClick={handleEdit}>
                                <UserRoundPen className="h-5 w-5" />
                            </button>
                            <button className="closebtn" onClick={closeModal}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>                        
                        <div className='grid grid-cols-1 gap-y-0 content-center relative group-[.hide]:-mt-.5 duration-300 ease-out transition-all'>
                            <img src='https://res.cloudinary.com/meme-topia/image/upload/v1723784096/image-removebg-preview_ciglfw.png' alt='Vec Logo'
                                className='-mb-5 group-[.hide]:w-[2.5rem] group-[.hide]:h-[2.5rem] z-10 duration-300 ease-in-out transition-all w-[6.5vmax]'></img>
                            <span className='font-rome text-[2vmax] text-amber-800 p-0 -mb-[0.75vmax]'>VELAMMAL</span>
                            <span className='font-rome text-black text-[1vmax] mt-0 p-0 transition-all ease-in-out duration-300'>ENGINEERING COLLEGE</span>
                            <span className="font-rome text-black text-[0.7vmax] mt-0 p-0 text-center transition-all ease-in-out duration-300">The Wheel of Knowledge rolls on!</span>
                        </div>
                        <h4 className="text-red-700 font-thin">Wardens ID</h4>
                        <img src={selectedWarden.img} alt="Warden" className="modal-img" />
                        <h2>{selectedWarden.name}</h2>
                        <p><span className="highlight -mt-2">Warden For:</span> {selectedWarden.wardenFor}</p>
                        <p><span className="highlight">In Charge:</span> {selectedWarden.in_charge}</p>
                        <p><span className="highlight">Date:</span> {selectedWarden.date}</p>
                        <p><span className="highlight">Primary Warden For:</span> {selectedWarden.primaryWarden.join(", ")}</p>
                        <p><span className="highlight">Secondary Warden For:</span> {selectedWarden.seconadryWarden.join(", ")}</p>
                        <p><span className="highlight">Status:</span> {selectedWarden.isActive ? "Active" : "Inactive"}</p>
                            
                    </div> ) : (
                     <div class="form-container">
                     <h2>Warden Profile Form</h2>
                     <form id="warden-form">
                       <div class="form-grid">
                         <div class="form-group">
                           <label for="warden-name">Name:</label>
                           <input type="text" id="warden-name" name="wardenName" placeholder="Enter Name" value={selectedWarden.name} />
                         </div>
                         <div class="form-group">
                           <label for="warden-for">Warden For:</label>
                           <input type="text" id="warden-for" name="wardenFor" placeholder="Enter position" value={selectedWarden.wardenFor} />
                         </div>
                         <div class="form-group">
                           <label for="primary-warden">Primary Warden for:</label>
                           <input type="text" id="primary-warden" name="primaryWarden" placeholder="Enter Phone" value={selectedWarden.primaryWarden}/>
                         </div>
                         <div class="form-group">
                           <label for="secondary-warden">Secondary Warden for:</label>
                           <input type="text" id="secondary-warden" name="secondaryWarden" placeholder="Enter Phone" value={selectedWarden.seconadryWardenWarden}/>
                         </div>
                         <div class="form-group">
                           <label for="warden-gender">Gender:</label>
                           <select id="warden-gender" name="wardenGender">
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                           </select>
                         </div>
                         <div class="form-group">
                           <label for="warden-photo">Upload Photo:</label>
                           <label class="custom-file-upload">
                             <input type="file" id="warden-photo" name="wardenPhoto" class="hidden-file" />
                             Choose File
                           </label>
                         </div>
                       </div>
                       <button>Cancel</button>
                       <button type="submit" class="submit-btn">Save Changes</button>
                     </form>
                   </div>

                   
                    )
                }
                </div>
            )}


            {/* Confirmation Popup */}
            {confirmModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Action</h2>
                        <p>Are you sure you want to {wardens[pendingToggleIndex].isActive ? "Deactivate" : "Activate"} this warden?</p>
                        <div className="button-container">
                            <button className="confirm-btn activate" onClick={() => toggleStatus(pendingToggleIndex)}>Confirm</button>
                            <button className="confirm-btn cancel" onClick={() => setConfirmModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <svg id="noise-svg">
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect id="noise-rect" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
};

export default WardenProfile;