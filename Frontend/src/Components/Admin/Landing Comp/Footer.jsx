import React, { forwardRef, useState, useEffect, useMemo } from "react";
import "./Footer.css";
import insta from "../../Assets/insta-logo.png";
import linkedin from "../../Assets/linkedin-logo.png";
import x from "../../Assets/X-logo.png";
import facebook from "../../Assets/facebook-logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useAdminRequest } from "../../hooks/useAdminRequest"; // <-- adjust path if needed

const AdminFooter = forwardRef((props, ref) => {
  const data = props.data;
  const navigate = useNavigate();
  const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        document.documentElement.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        document.body.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };
  const { sendRequest, loading: requestLoading } = useAdminRequest();

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [tempSaved, setTempSaved] = useState(false);


  const [baseData, setBaseData] = useState(null);
  const [editedData, setEditedData] = useState(null);

  // Normalize to stable payload shape (prevents undefined / missing arrays)
  const normalizeFooterMeta = (obj = {}) => {
    return {
      email: obj.email ?? "",
      address: Array.isArray(obj.address) ? obj.address : ["", "", "", ""],
      phone_number: obj.phone_number ?? "",
      student_affairs_contact: obj.student_affairs_contact ?? "",
      addmission_contact: Array.isArray(obj.addmission_contact)
        ? obj.addmission_contact
        : ["", ""],
      instagram: obj.instagram ?? "",
      linkedin: obj.linkedin ?? "",
      twitter: obj.twitter ?? "",
      facebook: obj.facebook ?? "",
    };
  };

  // Initialize from props.data
  useEffect(() => {
    if (!data) return;

    // snapshot original (deep copy to avoid accidental shared mutations)
    const snapshot = JSON.parse(JSON.stringify(data));

    setBaseData(snapshot);
    setEditedData(snapshot);

    setIsEditing(false);
    setHasChanges(false);
    setTempSaved(false);
    setConfirmPopup(false);
  }, [data]);

  const normalizedBase = useMemo(
    () => normalizeFooterMeta(baseData || {}),
    [baseData]
  );
  const normalizedEdited = useMemo(
    () => normalizeFooterMeta(editedData || {}),
    [editedData]
  );

  const handleInputChange = (field, value, index = null) => {
    setHasChanges(true);
    setTempSaved(false);

    setEditedData((prev) => {
      const safePrev = prev || {};
      if (index !== null) {
        const updatedArray = Array.isArray(safePrev[field])
          ? [...safePrev[field]]
          : [];
        updatedArray[index] = value;
        return { ...safePrev, [field]: updatedArray };
      }
      return { ...safePrev, [field]: value };
    });
  };

  // "Save" should only mean: admin finished editing locally and is ready to request
  // It MUST NOT change baseData.
  const handleSave = () => {
    setHasChanges(false);
    setIsEditing(false);
    setTempSaved(true);
  };

  // Cancel editing: revert editedData back to baseData (original from backend)
  const handleCancel = () => {
    setEditedData(JSON.parse(JSON.stringify(baseData || {})));
    setHasChanges(false);
    setIsEditing(false);
    setTempSaved(false);
  };

  // Discard changes completely (same as cancel, but from the "tempSaved" state)
  const handleDiscard = () => {
    setEditedData(JSON.parse(JSON.stringify(baseData || {})));
    setHasChanges(false);
    setTempSaved(false);
  };

  const handleRequest = () => {
    setConfirmPopup(true);
  };

  const buildFooterPayload = () => {
    return {
      collectionName: "landing_page_details",
      collection_type: "page_details",
      action: "update",
      title: "update in page_details (footer/contact)",
      meta_data: normalizedEdited, // changed/new values
      original_data: normalizedBase, // original values (must not change)
    };
  };

  const handleConfirmRequest = async () => {
    try {
      const payload = buildFooterPayload();

      console.log("Submitting footer payload:", payload);

      const res = await sendRequest(payload);

      if (res?.success) {
        setConfirmPopup(false);
        setIsEditing(false);
        setHasChanges(false);
        setTempSaved(false);
      }
    } catch (e) {
      console.error("Failed to submit footer payload:", e);
    }
  };

  const renderInputField = (field, value, index = null, type = "text") => {
    return (
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => handleInputChange(field, e.target.value, index)}
        className="footer-input"
      />
    );
  };

  const changesSummary = useMemo(() => {
    const same =
      JSON.stringify(normalizedEdited) === JSON.stringify(normalizedBase);
    return same ? "No changes" : "Multiple changes";
  }, [normalizedEdited, normalizedBase]);

  // While data is loading
  if (!editedData) return null;

  return (
    <>
      <footer
        id="footer"
        className="lg:flex flex-wrap footer font-popp
          bg-[linear-gradient(111deg,theme(colors.secd)_0%,theme(colors.secd)_3%,theme(colors.text)_3%,theme(colors.text)_90%,theme(colors.secd)_90%,theme(colors.secd)_100%)]
          dark:bg-[linear-gradient(111deg,theme(colors.drks)_0%,theme(colors.drks)_3%,theme(colors.text)_3%,theme(colors.text)_90%,theme(colors.drks)_90%,theme(colors.drks)_100%)]
          relative"
        ref={ref}
      >
        {/* Edit Button */}
        {!isEditing && (
          <button
            className="absolute top-2 right-8 bg-secd dark:bg-drks text-text dark:text-drkt px-3 py-1 rounded-md flex items-center gap-2 hover:bg-brwn hover:text-prim"
            onClick={() => setIsEditing(true)}
            disabled={requestLoading}
          >
            <Pencil size={16} /> Edit
          </button>
        )}

        {/* Contact Section */}
        <div className="contact-details basis-1/4 ml-4">
          <div className="block md:flex lg:block justify-around">
            <div className="mt-4">
              <h3
                className="text-secd dark:text-drks font-bold"
                style={{ padding: "0 20px", marginTop: "5px" }}
              >
                Contact Address
              </h3>

              {isEditing ? (
                <div>
                  {(editedData.address || ["", "", "", ""]).map((line, index) => (
                    <div key={index}>
                      {renderInputField("address", line, index)}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ marginTop: "-2%", fontSize: "17px", color: "white" }}>
                  {editedData?.address?.[0]}
                  <br />
                  {editedData?.address?.[1]}
                  <br />
                  {editedData?.address?.[2]}
                  <br />
                  {editedData?.address?.[3]}
                </p>
              )}
            </div>

            <div>
              <p style={{ marginTop: "27px" }}>
                Contact:{" "}
                {isEditing ? (
                  renderInputField("phone_number", editedData.phone_number)
                ) : (
                  <a
                    className="text-secd dark:text-drks hover:text-prim font-bold"
                    href={`tel:${editedData.phone_number}`}
                    style={{ textDecoration: "none" }}
                  >
                    {editedData.phone_number}
                  </a>
                )}
              </p>

              <p>
                Student Affair:{" "}
                {isEditing ? (
                  renderInputField(
                    "student_affairs_contact",
                    editedData.student_affairs_contact
                  )
                ) : (
                  <a
                    href={`tel:${editedData.student_affairs_contact}`}
                    className="text-secd dark:text-drks hover:text-prim font-bold"
                    style={{ textDecoration: "none" }}
                  >
                    {editedData.student_affairs_contact}
                  </a>
                )}
              </p>

              <p>
                For Admissions:{" "}
                {isEditing ? (
                  <div>
                    {renderInputField(
                      "addmission_contact",
                      editedData.addmission_contact?.[0],
                      0
                    )}
                    {renderInputField(
                      "addmission_contact",
                      editedData.addmission_contact?.[1],
                      1
                    )}
                  </div>
                ) : (
                  <>
                    <a
                      href={`tel:${editedData.addmission_contact?.[0]}`}
                      className="text-secd dark:text-drks hover:text-prim font-bold"
                      style={{ textDecoration: "none" }}
                    >
                      {editedData.addmission_contact?.[0]}
                    </a>{" "}
                    ,{" "}
                    <a
                      href={`tel:${editedData.addmission_contact?.[1]}`}
                      className="text-secd dark:text-drks hover:text-prim font-bold"
                      style={{ textDecoration: "none" }}
                    >
                      {editedData.addmission_contact?.[1]}
                    </a>
                  </>
                )}
              </p>

              <div>
                <a
                  href="/Term_and_Conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secd dark:text-drks ml-5"
                >
                  Privacy, Terms and Conditions
                </a>
              </div>

              <div className="logo-container my-2">
                {isEditing ? (
                  <div>
                    <p>
                      Instagram URL:{" "}
                      {renderInputField("instagram", editedData.instagram)}
                    </p>
                    <p>
                      LinkedIn URL:{" "}
                      {renderInputField("linkedin", editedData.linkedin)}
                    </p>
                    <p>
                      Twitter URL:{" "}
                      {renderInputField("twitter", editedData.twitter)}
                    </p>
                    <p>
                      Facebook URL:{" "}
                      {renderInputField("facebook", editedData.facebook)}
                    </p>
                  </div>
                ) : (
                  <>
                    <a href={editedData.instagram} target="_blank" rel="noopener noreferrer">
                      <img src={insta} alt="Insta" />
                    </a>
                    <a href={editedData.linkedin} target="_blank" rel="noopener noreferrer">
                      <img src={linkedin} alt="LinkedIn" />
                    </a>
                    <a href={editedData.twitter} target="_blank" rel="noopener noreferrer">
                      <img src={x} alt="Twitter" />
                    </a>
                    <a href={editedData.facebook} target="_blank" rel="noopener noreferrer">
                      <img src={facebook} alt="Facebook" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="footer-map basis-1/3 md:h-[20vh] lg:h-[45vh] mt-10">
          <iframe
            className="px-3 w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1757.9530530830932!2d80.19081618175407!3d13.149609328912868!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5264a10c856599%3A0xac3348f41097ba7f!2sVelammal%20Engineering%20College!5e1!3m2!1sen!2sin!4v1723700873764!5m2!1sen!2sin"
            width="400"
            height="260"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Google Maps"
          ></iframe>
        </div>

        {/* Quick Links */}
        <div className="quick-links basis-1/3 px-4 mt-4">
          <h3 className="text-secd dark:text-drks font-bold text-center md:text-left">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="quick-head font-semibold text-lg text-center lg:text-left">
                Profile
              </h4>
              <ul className="grid grid-cols-2 md:block gap-x-4 gap-y-1 text-left">
                <li><Link to="/abt-us" onClick={scrollToTop} >About Us</Link></li>
                <li><Link to="/abt-yr" onClick={scrollToTop} >AISHE</Link></li>
                <li><Link to="/Accreditation" onClick={scrollToTop} state={{ section: "NBA" }}>NBA</Link></li>
                <li><Link to="/Accreditation" onClick={scrollToTop} state={{ section: "NAAC" }}>NAAC</Link></li>
                <li><Link to="/Accreditation" onClick={scrollToTop} state={{ section: "NIRF" }}>NIRF</Link></li>
                <li><Link to="/Accreditation" onClick={scrollToTop} state={{ section: "QS Rating" }}>QS Rating</Link></li>
                <li><Link to="/iic" onClick={scrollToTop} >IIC</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="quick-head font-semibold text-lg text-center lg:text-left">
                Academics
              </h4>
              <ul className="grid grid-cols-2 md:block gap-x-4 gap-y-1 text-left">
                <li><a href="/departments">Departments</a></li>
                <li><a href="/programs">Programmes</a></li>
                <li><a href="/library">Library</a></li>
                <li><a href="/nss">NSS</a></li>
                <li><a href="/ncc">NCC</a></li>
                <li><a href="/yrc">YRC</a></li>
                <li><a href="/sports">Sports</a></li>
              </ul>
            </div>

            <div>
              <h4 className="quick-head font-semibold text-lg text-center lg:text-left">
                Important
              </h4>
              <ul className="grid grid-cols-2 md:block gap-x-4 gap-y-1 text-left">
                <li><a href="https://vecchennai.org/studentlogin/login.php?done=/studentlogin/" target="_blank" rel="noreferrer">Student Login</a></li>
                <li><a href="https://vecchennai.org/stafflogin/login.php?done=/stafflogin/" target="_blank" rel="noreferrer">Faculty Login</a></li>
                <li><a href="https://easycollege.in/vecengg/college/webpayindex.aspx" target="_blank" rel="noreferrer">Fees Payment</a></li>
                <li><a href="/grievances">Grievances</a></li>
                <li><a href="/admin_auth">Login</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        {isEditing ? (
          <div className="w-full flex gap-4 p-4 ml-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              disabled={requestLoading}
            >
              Cancel
            </button>

            {hasChanges && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-md"
                disabled={requestLoading}
              >
                Save
              </button>
            )}
          </div>
        ) : (
          tempSaved && (
            <div className="w-full flex justify-center gap-4 p-4 mt-4">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                disabled={requestLoading}
              >
                Discard Changes
              </button>
              <button
                onClick={handleRequest}
                className="px-4 py-2 bg-secd text-text hover:bg-brwn hover:text-prim rounded-md"
                disabled={requestLoading}
              >
                Request
              </button>
            </div>
          )
        )}

        <div className="flex flex-col items-center justify-center w-full mt-3">
          <p className="text-center">
            <a
              href="/webteam"
              rel="noopener noreferrer"
              className="text-secd dark:text-drks ml-5 text-center text-md mt-4 font-medium m-auto cursor-pointer"
            >
              © WebOps VEC
            </a>
            , Velammal Engineering College, Chennai
          </p>
        </div>
        
      </footer>

      {/* Confirmation Popup */}
      {confirmPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin.
              Once approved, they will be applied automatically to the live site.
            </p>

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
                    <td className="py-1">Footer / Contact Information</td>
                    <td className="py-1 text-[12px] text-center">{changesSummary}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
                disabled={requestLoading}
              >
                {requestLoading ? "Submitting..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default AdminFooter;