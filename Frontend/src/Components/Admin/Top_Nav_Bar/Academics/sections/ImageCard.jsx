import React, { useEffect, useState } from "react";
import { SiPublons } from "react-icons/si";
import { FaOrcid, FaResearchgate, FaLinkedin, FaBook } from "react-icons/fa";
import { FaGoogleScholar } from "react-icons/fa6";

import { Trash2 } from "lucide-react";
import styles from "./Faculties.module.css";


/**
 * ImageCard
 * - Checkbox for selection (not direct delete)
 * - Replace image allowed in edit mode
 * - Link editor modal
 */
function ImageCard({
  name,
  photo,
  Designation,
  Scholar,
  Research,
  Orchid,
  Publon,
  Scopus,
  Linkedin,
  firstTile,
  uid,
  profile,
  isEdit,
  teaching,
  onChange,
  onSelect, // new prop for checkbox selection (parent toggles)
  selected, // new prop to indicate if selected
  onDelete, // optional single-delete callback (parent can implement)
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) =>
    !path ? "" : String(path).startsWith("http") ? path : `${BASE_URL}${path}`;

  const initialLinks = {
    linkedin: Linkedin || "",
    googlescholar: Scholar || "",
    researchgate: Research || "",
    orchidprofile: Orchid || "",
    publonprofile: Publon || "",
    scopus: Scopus || "",
  };


  const [links, setLinks] = useState(initialLinks);
  const [updatedLinks, setUpdatedLinks] = useState(initialLinks);
  const [linkEditer, setLinkEditer] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    const merged = {
      linkedin: Linkedin || "",
      googlescholar: Scholar || "",
      researchgate: Research || "",
      orchidprofile: Orchid || "",
      publonprofile: Publon || "",
      scopus: Scopus || "",
    };
    setLinks(merged);
    setUpdatedLinks(merged);
  }, [Linkedin, Scholar, Research, Orchid, Publon, Scopus]);

  const handleSaveLinks = () => {
    setLinks(updatedLinks);
    setLinkEditer(false);
    onChange?.("socialmedia_links", updatedLinks, uid);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhotoPreview(dataUrl);
      onChange?.("image_path", dataUrl, uid);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`rounded-lg 
        bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] 
        dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
        ${firstTile ? "w-full md:w-[95%]" : "w-full md:w-[90%]"} 
        h-auto 
        ${firstTile ? styles.firstTile : styles.imageCard} 
        mx-3 relative`}
    >
      {/* Checkbox only in edit mode (not for HOD / firstTile) */}
      {isEdit && !firstTile && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={() => onSelect?.(uid)}
          title="Select faculty"
          aria-label={`Select faculty ${name || uid}`}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            cursor: "pointer",
            zIndex: 30,
            width: 18,
            height: 18,
          }}
        />
      )}

      <div>
        <img
          src={photoPreview || UrlParser(photo)}
          alt={name}
          className={firstTile ? styles.firstTileImage : styles.image}
        />
        {isEdit && (
          <>
            <input
              id={`replace-photo-${uid}`}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label
              htmlFor={`replace-photo-${uid}`}
              className="flex text-text justify-center hover:text-prim bg-secd hover:bg-brwn px-2 py-2 rounded my-2 cursor-pointer"
            >
              Replace image
            </label>
          </>
        )}
      </div>

      <div
        className={
          firstTile
            ? styles.firstTileContent
            : styles.cardContent + " p-4 flex gap-2 flex-col items-center"
        }
      >
        {/* Name */}
        {isEdit ? (
          <input
            type="text"
            value={name || ""}
            onChange={(e) => onChange?.("name", e.target.value, uid)}
            className={`${
              firstTile
                ? "w-80 h-8 text-text dark:text-drkt pl-2 rounded"
                : "w-60 text-text dark:text-drkt pl-2 rounded"
            }`}
          />
        ) : (
          <h3 className={styles.facultyName + " text-text dark:text-drkt"}>
            {name}
          </h3>
        )}

        {/* Designation */}
        {isEdit ? (
          <select
            value={Designation || ""}
            onChange={(e) => onChange?.("designation", e.target.value, uid)}
            className={`${
              firstTile
                ? "w-80 h-8 text-text dark:text-drkt pl-2 rounded"
                : "w-60 text-text dark:text-drkt pl-2 rounded"
            }`}
          >
            <option value="" disabled actived hidden>
              Select Designation
            </option>
            {firstTile && (
              <option value="Professor & Head">Professor & Head</option>
            )}
            {firstTile && (
              <option value="Associative & Head">Associative & Head</option>
            )}
            {teaching &&  !firstTile && <option value="Professor">Professor</option>}
            {teaching && !firstTile &&  (
              <option value="Assistant Professor">Assistant Professor</option>
            )}
            {teaching && !firstTile && (
              <option value="Associative Professor">
                Associative Professor
              </option>
            )}
            {!teaching && !firstTile && (
              <option value="Lab Assistant">Lab Assistant</option>
            )}
            {!teaching && !firstTile && (
              <option value="Lab Instructor">Lab Instructor</option>
            )}
          </select>
        ) : (
          <h3 className={styles.facultyName + " text-text dark:text-drkt"}>
            {Designation}
          </h3>
        )}

        {/* Social Links */}
        <div
          className={
            isEdit
              ? firstTile
                ? "flex flex-col w-80 gap-4 mt-2 border-2 border-gray-400 border-dashed p-2 mt-4 rounded"
                : "flex flex-col w-60 gap-4 mt-2 border-2 border-gray-400 border-dashed p-3 mt-4 rounded"
              : firstTile
              ? "flex flex-col w-80 gap-4 mt-2"
              : "flex flex-col w-60 gap-4 mt-2"
          }
        >
          <div
            className={`${
              firstTile ? styles.firstTileSocialLinks : styles.socialLinks
            } m-auto flex gap-4`}
          >
            {links.linkedin && (
              <a href={links.linkedin} target="_blank" rel="noreferrer">

                <FaLinkedin className="text-brwn dark:text-drka" />
              </a>
            )}
            {links.publonprofile && (
              <a href={links.publonprofile} target="_blank" rel="noreferrer">
                <SiPublons className="text-brwn dark:text-drka" />
              </a>
            )}
            {links.googlescholar && (
              <a href={links.googlescholar} target="_blank" rel="noreferrer">
                <FaGoogleScholar className="text-brwn dark:text-drka" />
              </a>
            )}
            {links.orchidprofile && (
              <a href={links.orchidprofile} target="_blank" rel="noreferrer">
                <FaOrcid className="text-brwn dark:text-drka" />
              </a>
            )}
            {links.researchgate && (
              <a href={links.researchgate} target="_blank" rel="noreferrer">
                <FaResearchgate className="text-brwn dark:text-drka" />
              </a>
            )}
            {links.scopus && (
              <a href={links.scopus} target="_blank" rel="noreferrer">
                <FaBook className="text-brwn dark:text-drka" />
              </a>
            )}
          </div>


          {isEdit && (
            <button
              className="hover:text-prim bg-secd hover:bg-brwn px-2 py-2 rounded w-40 m-auto"
              onClick={(e) => setLinkEditer(true)}
            >
              Add / Edit Links
            </button>
          )}
        </div>

{/* ✅ Single Link Editor Modal (works for both firstTile and other tiles) */}
{isEdit && linkEditer && (
  <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60 ">
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    bg-white p-6 rounded-xl shadow-2xl min-w-[850px] max-w-[90%] max-h-[75vh] 
                    overflow-y-auto border border-gray-200">
      
      {/* Title changes dynamically */}
      <h2 className="text-xl font-bold mb-4 text-center text-[#800000]">
      Add / Edit links 
      </h2>

      {/* Editable Table */}
      <table className="w-full h border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Profile</th>
            <th className="border px-2 text-left py-1">Link</th>
            <th className="border px-2 text-left py-1">Delete</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(updatedLinks).map(([key, value]) => (
            <tr key={key}>
              <td className="border px-2 font-medium py-1">{key}</td>
              <td className="border px-2 py-1">
                <input
                  type="text"
                  value={value || ""}
                  onChange={(e) =>
                    setUpdatedLinks({
                      ...updatedLinks,
                      [key]: e.target.value,
                    })
                  }
                  className="border px-2 py-1 w-full rounded focus:ring focus:ring-[#fdcc03]"
                />
              </td>
              <td className="border px-4 w-20 text-center text-red-500 py-1">
                <button
                  onClick={() =>
                    setUpdatedLinks({ ...updatedLinks, [key]: "" })
                  }
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button

          onClick={() => {
            setUpdatedLinks(links);
            setLinkEditer(false);
          }}

          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveLinks}
          className="px-4 py-2 flex items-center gap-2 bg-[#fdcc03] text-text rounded-lg hover:bg-[#800000] hover:text-prim"
        >
          Save
        </button>
      </div>

    </div>
  </div>
)}


        {/* Resume Button */}
        {!isEdit && (
          <button
            onClick={() => {
              if (profile?.trim()) {
                const url = UrlParser(profile);
                if (url) window.open(url, "_blank", "noreferrer");
              }
            }}
            className={
              styles.facButton +
              " bg-brwn hover:text-text dark:bg-drks hover:bg-secd text-prim dark:text-black"
            }
          >
            View More
          </button>
        )}
      </div>
    </div>
  );
}

export default ImageCard;
