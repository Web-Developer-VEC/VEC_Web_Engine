import React, { useState } from "react";
import "./WardenProfile.css";
import HostelSidebar from "../HostelStudents/HostelSidebar";
import { Mail, Lock, User, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { UserRoundPen } from 'lucide-react';

const WardenProfile = () => {
    const [wardens, setWardens] = useState([
        {
            name: "Kumar",
            img: "",
            wardenFor: "3rd Year",
            in_charge: "Boys",
            date: "05-07-2015",
            isActive: true,
            primaryWarden: [3, 4],
            secondaryWarden: [1, 2],
        },
        {
            name: "mohan",
            img: "https://www.shutterstock.com/image-photo/headshot-portrait-happy-millennial-man-260nw-1548802709.jpg",
            wardenFor: "2nd Year",
            in_charge: "Boys",
            date: "12-09-2018",
            isActive: false,
            primaryWarden: [2, 1],
            secondaryWarden: [4, 3],
        },
        {
            name: "jaya balan",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcv8rksm8UZHtwTRw2-kKPDToXKED6uIhNXOE3ED6c7LPISDfZe7x_AMPc1Yt6XGBl_rI&usqp=CAU",
            wardenFor: "2nd Year",
            in_charge: "Boys",
            date: "12-09-2018",
            isActive: false,
            primaryWarden: [2, 1],
            secondaryWarden: [4, 3],
        },
        {
            name: "swathi",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpTWMdWCC7GdXFGOq9XDB5BVC-Clp7kq4oGA&s",
            wardenFor: "2nd Year",
            in_charge: "Girls",
            date: "12-09-2018",
            isActive: false,
            primaryWarden: [2, 1],
            secondaryWarden: [4, 3],
        },
        {
            name: "hema",
            img: "https://static.vecteezy.com/system/resources/thumbnails/038/962/461/small/ai-generated-caucasian-successful-confident-young-businesswoman-ceo-boss-bank-employee-worker-manager-with-arms-crossed-in-formal-wear-isolated-in-white-background-photo.jpg",
            wardenFor: "2nd Year",
            in_charge: "Girls",
            date: "12-09-2018",
            isActive: false,
            primaryWarden: [2, 1],
            secondaryWarden: [4, 3],
        },
    ]);


    const [selectedWarden, setSelectedWarden] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingToggleIndex, setPendingToggleIndex] = useState(null);
    const [edit, setEdit] = useState('');
    const [uploadedImage, setUploadedImage] = useState("");

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedWarden((prev) => ({
                    ...prev,
                    image: reader.result, // Update the image in state
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    

    const toggleStatus = (index) => {
        const updatedWardens = [...wardens];
        updatedWardens[index] = { ...updatedWardens[index], isActive: !updatedWardens[index].isActive };
        setWardens(updatedWardens);
        setConfirmModalOpen(false); // Close confirmation popup after updating status
        console.log(updatedWardens);
    };

const changeData = () => {
    setWardens((prevWardens) => {
        return prevWardens.map((warden) =>
            warden.name === selectedWarden.name
                ? {
                    ...warden,
                    name: document.getElementById("warden-name").value || "-",
                    wardenFor: document.getElementById("warden-for").value || "-",
                    primaryWarden: document.getElementById("primary-warden").value.split(",") || [],
                    secondaryWarden: document.getElementById("secondary-warden").value.split(",") || [],
                    in_charge: document.getElementById("warden-gender").value || "-",
                    date: new Date().toLocaleDateString() || '-',
                    image: uploadedImage || warden.img,
                }
                : warden
        );
    });

    // Update the selected warden state as well
    setSelectedWarden((prev) => ({
        ...prev,
        name: document.getElementById("warden-name").value || "-",
        wardenFor: document.getElementById("warden-for").value || "-",
        primaryWarden: document.getElementById("primary-warden").value.split(",") || [],
        secondaryWarden: document.getElementById("secondary-warden").value.split(",") || [],
        in_charge: document.getElementById("warden-gender").value || "-",
        date: new Date().toLocaleDateString() || '-',
        image: uploadedImage || prev.img,
    }));

    console.log("Updated Wardens List:", wardens);
};


    const openModal = (event, warden) => {
        if (!event.target.closest('.switch-and-button')) {
            console.log('kumar');
            setEdit('off')
            setSelectedWarden(warden);
            setIsModalOpen(true);
        }
    };

    const handleEdit = () => {
        console.log('kumar')
        setEdit((prevEdit) => (prevEdit === "on" ? "off" : "on"));
    };
    

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
        setSelectedWarden((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const safeJoin = (arr, separator = ", ") => {
        if (!arr) return "";
        if (!Array.isArray(arr)) return String(arr);
        return arr.filter(item => item != null).join(separator);
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
                                    <label htmlFor={`toggle-${index}`} className="handle-label">
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
                        <p><span className="highlight">Secondary Warden For:</span> {selectedWarden.secondaryWarden.join(", ")}</p>
                        <p><span className="highlight">Status:</span> {selectedWarden.isActive ? "Active" : "Inactive"}</p>
                            
                    </div> ) : (
                     <div class="form-container" onClick={(e) => e.stopPropagation()}>
                     <h2>Warden Profile Form</h2>
                     <form id="warden-form">
                       <div class="form-grid">
                         <div class="form-group">
                           <label for="warden-name">Name:</label>
                           <input 
                                type="text" 
                                id="warden-name" 
                                name="name" 
                                placeholder="Enter Name" 
                                value={selectedWarden.name || ""}
                                onChange={handleChange} 
                            />
                         </div>
                         <div class="form-group">
                           <label for="warden-for">Warden For:</label>
                           <input 
                                type="text" 
                                id="warden-for" 
                                name="wardenFor" 
                                placeholder="Enter position" 
                                value={selectedWarden.wardenFor || ""} 
                                onChange={handleChange} 
                            />
                         </div>
                         <div class="form-group">
                           <label for="primary-warden">Primary Warden for:</label>
                           <input 
                                type="text" 
                                id="primary-warden" 
                                name="primaryWarden" 
                                placeholder="Enter Phone" 
                                value={safeJoin(selectedWarden?.primaryWarden) || ""} 
                                onChange={handleChange} 
                            />
                         </div>
                         <div class="form-group">
                           <label for="secondary-warden">Secondary Warden for:</label>
                           <input 
                                type="text" 
                                id="secondary-warden" 
                                name="secondaryWarden" 
                                placeholder="Enter Phone" 
                                value={safeJoin(selectedWarden?.secondaryWarden) || ""} 
                                onChange={handleChange} 
                            />
                         </div>
                         <div class="form-group">
                           <label for="warden-gender">Gender:</label>
                           <select 
                                id="warden-gender" 
                                name="in_charge" 
                                value={selectedWarden.in_charge || ""}
                                onChange={handleChange}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>

                         </div>
                         <div class="form-group">
                            <label for="warden-photo">Upload Photo:</label>
                            <label class="custom-file-upload">
                                <input 
                                    type="file" 
                                    id="warden-photo" 
                                    name="wardenPhoto" 
                                    accept="image/*" 
                                    onChange={handleImageChange}  
                                />
                                <div className="image-preview w-1 h-1 rounded-md">
                                    <img src={selectedWarden.img} alt="Warden" />
                                </div>
                            </label>
                        </div>                          
                        </div>
                        <div className="form-grid">
                            <button class="cancel-btn" onClick={handleEdit} >Discard Changes</button>
                            <button type="submit" onClick={changeData} class="submit-btn">Save Changes</button>
                        </div>
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