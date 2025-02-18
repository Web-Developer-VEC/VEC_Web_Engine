import "./AdmissionHost.css";

export default function Admissions() {
  return (
    <div className="admissions-container">
      <h2 className="admissions-title">Admissions Open</h2>
      <p className="admissions-text">
        Enroll now to experience world-class hostel facilities. Secure your spot today and be a part of our vibrant campus life!
      </p>
      <div className="admissions-buttons">
        <button className="admissions-button apply-now">Apply Now</button>
        <button className="admissions-button fee-payment">Fee Payment</button>
      </div>
    </div>
  );
}
