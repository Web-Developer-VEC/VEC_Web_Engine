import React, { useState, useEffect } from 'react';
import './sideButton.css';
import { FaArrowUp } from 'react-icons/fa';

const SideButton = () => {  // Changed from sideButton to SideButton
  const [showPopup, setShowPopup] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userCaptcha, setUserCaptcha] = useState("");

  function generateCaptcha() {
    return Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
  }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    state: '',
    city: '',
    program: '',
    course: '',
    captcha: '',
    authorize: false
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.program) newErrors.program = 'Program is required';
    if (!formData.course) newErrors.course = 'Course is required';
    if (!formData.captcha) newErrors.captcha = 'Captcha is required';
    if (!formData.authorize) newErrors.authorize = 'You must authorize contact';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userCaptcha !== captcha.toString()) {
      alert("Incorrect CAPTCHA, please try again.");
      setCaptcha(generateCaptcha());
      return;
    }

    
    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      
      // Simulate API call
      setSubmissionStatus('submitting');
      setTimeout(() => {
        setSubmissionStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            mobile: '',
            state: '',
            city: '',
            program: '',
            course: '',
            captcha: '',
            authorize: false
          });
          setSubmissionStatus(null);
          setShowPopup(false);
        }, 2000);
      }, 1000);
    }
  };

  return (
    <>
      <a href="https://admission.velammal.edu.in/" target="_blank" rel="noopener noreferrer" className="appluBtn appluBtn_right vertcalview-1"> APPLY NOW </a>

      <button id="enquireNowBtn" className="enquire-now-btns vertcalview" onClick={() => setShowPopup(true)}>Enquire Now !</button>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-container">
            <div className="popup-form" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
              <h3>Enquiry Form</h3>
              
              {submissionStatus === 'success' ? (
                <div className="success-message">
                  <p>Thank you for your enquiry! We'll contact you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="popup-form-content">
                  {/* Name - Full width */}
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter Name *"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error-input' : ''}
                  />
                  {errors.name && <span className="error">{errors.name}</span>}

                  {/* Email - Full width */}
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email Address *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error-input' : ''}
                  />
                  {errors.email && <span className="error">{errors.email}</span>}

                  {/* Phone - Full width */}
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Enter Mobile Number *"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={errors.mobile ? 'error-input' : ''}
                  />
                  {errors.mobile && <span className="error">{errors.mobile}</span>}

                  {/* State and City - Two fields per row */}
                  <div className="form-row-1">
                    <div className="form-field">
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={errors.state ? 'error-input' : ''}
                      >
                        <option value="">Select State *</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                      </select>
                      {errors.state && <span className="error">{errors.state}</span>}
                    </div>

                    <div className="form-field">
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? 'error-input' : ''}
                      >
                        <option value="">Select City *</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Coimbatore">Coimbatore</option>
                        <option value="Madurai">Madurai</option>
                        <option value="Hyderabad">Hyderabad</option>
                      </select>
                      {errors.city && <span className="error">{errors.city}</span>}
                    </div>
                  </div>

                  {/* Program and Course - Two fields per row */}
                  <div className="form-row-1">
                    <div className="form-field">
                      <select
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        className={errors.program ? 'error-input' : ''}
                      >
                        <option value="">Select Program *</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Arts and Science">Arts and Science</option>
                        <option value="Law">Law</option>
                      </select>
                      {errors.program && <span className="error">{errors.program}</span>}
                    </div>

                    <div className="form-field">
                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        className={errors.course ? 'error-input' : ''}
                      >
                        <option value="">Select Course *</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="MBBS">MBBS</option>
                        <option value="MBA">MBA</option>
                        <option value="BBA">BBA</option>
                        <option value="BSc">BSc</option>
                      </select>
                      {errors.course && <span className="error">{errors.course}</span>}
                    </div>
                  </div>

                  {/* Captcha - Full width */}
                  <div className="form-row-1">
                    <div className="form-field">
                      <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="bg-prim dark:bg-drkts rounded-lg py-3 text-center font-extrabold text-xl tracking-widest text-[#800000]">
                  {captcha}
                </div>
                     <input 
                    type="text"
                  className="bg-transparent border-b-2 border-gray-300 focus:border-[#800000] dark:border-gray-600 dark:focus:border-[#800000] focus:outline-none py-2 px-1 text-text dark:text-prim"
                  placeholder="Enter Captcha"
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  required
                  /> 
                  </div>
                      {/* {errors.captcha && <span className="error">{errors.captcha}</span>} */}
                    </div>
                  </div>
                  {/* Checkbox */}
                  <div className="checkbox-row">
                    <input
                      type="checkbox"
                      id="authorize"
                      name="authorize"
                      checked={formData.authorize}
                      onChange={handleInputChange}
                      className={errors.authorize ? 'error-input' : ''}
                    />
                    <label htmlFor="authorize">
                      I authorize contact via Email, SMS, WhatsApp or Call for updates even if I am on DND.
                    </label>
                  </div>
                  {errors.authorize && <span className="error">{errors.authorize}</span>}

                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={submissionStatus === 'submitting'}
                  >
                    {submissionStatus === 'submitting' ? 'Submitting...' : 'SUBMIT'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default SideButton;