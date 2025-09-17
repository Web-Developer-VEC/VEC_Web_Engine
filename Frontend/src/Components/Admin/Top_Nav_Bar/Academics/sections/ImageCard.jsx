import React, { useState } from "react";
import {useNavigate} from 'react-router-dom';
import { SiPublons } from "react-icons/si";
import { FaOrcid, FaResearchgate, FaLinkedin, FaBook } from "react-icons/fa";
import styles from "./Faculties.module.css";
import { FaGoogleScholar } from "react-icons/fa6";
import { input, style } from "framer-motion/m";



function ImageCard ({ name, photo, Designation, Scholar, Research, Orchid, Publon, Scopus, Linkedin, firstTile ,uid, profile, isEdit,teaching}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return  (
    <>
    <div 
      className={`rounded-lg bg-[color-mix(in_srgb,theme(colors.prim)_85%,black)] 
                  dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                  h-[95%] 
                  ${firstTile ? 'w-[65%] lg:w-full mb-8 lg:mr-10 basis-full mx-3' : 'w-fit lg:w-[90%]'} 
                  ${firstTile ? styles.firstTile : styles.imageCard}`}>

      <div >
      <img src={UrlParser(photo)} alt={name} className={firstTile ? styles.firstTileImage : styles.image} />
      
      <button className={`flex text-text m-auto hover:text-prim bg-secd hover:bg-brwn px-2 py-2 rounded my-2` } style={{display: isEdit ? "flex":"none"}} > Replace image</button>
      </div>
      <div className={firstTile ? styles.firstTileContent : styles.cardContent+" p-4 flex gap-2 flex-col items-center"}>
        {isEdit ? (
          <input type="text" value={name}  className={` ${firstTile ? "w-80 h-8 text-text dark:text-drkt pl-2 rounded":"w-60 text-text dark:text-drkt pl-2 rounded"}`}/>
        ):(
          <h3 className={styles.facultyName + " text-text dark:text-drkt"}>{name}</h3>
        )}
        {isEdit ? (
         
          firstTile ? (<h3 className={styles.facultyName + " text-text dark:text-drkt"}>{Designation}</h3>)
          :
          (
            <select name="" id="" value={Designation}  className={` ${firstTile ? "w-80 h-8 text-text dark:text-drkt pl-2 rounded":"w-60 text-text dark:text-drkt pl-2 rounded"}`}>
                <option value="" disabled>Select Designation</option>
               {teaching && <option value="Professor">Professor</option>}
              {teaching  && <option value="Assistant Professor">Assistant Professor</option>}
              {teaching && <option value="Associative Professor">Associative Professor</option>}
              {!teaching && <option value="Lab Assistant">Lab Assistant</option>}
              {!teaching && <option value="Lab Instructor">Lab Instructor</option>}
              
            </select>
        )
        ):(
             <h3 className={styles.facultyName + " text-text dark:text-drkt"}>{Designation}</h3>
        
        )}
          
          <div className={`${isEdit ? `${firstTile ? " flex flex-col w-80 gap-4 mt-2 border-2 border-gray-400 border-dashed p-2 mt-4 rounded":"flex flex-col w-60 gap-4 mt-2 border-2 border-gray-400 border-dashed p-3 mt-4 rounded" }`: `${firstTile ? " flex flex-col w-80 gap-4 mt-2 ":"flex flex-col w-60 gap-4 mt-2 " }`} `}>

          <div className={`${firstTile ? styles.firstTileSocialLinks : styles.socialLinks} h-[10px] m-auto flex gap-4`}>
            {Linkedin && (
              <a href={Linkedin} target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="text-brwn dark:text-drka" />
              </a>
            )}
            {Publon && (
              <a href={Publon} target="_blank" rel="noopener noreferrer">
                <SiPublons  className="text-brwn dark:text-drka" />
              </a>
            )}
            {Scholar && (
              <a href={Scholar} target="_blank" rel="noopener noreferrer">
                <FaGoogleScholar className="text-brwn dark:text-drka" />
              </a>
            )}
            {Orchid && (
              <a href={Orchid} target="_blank" rel="noopener noreferrer">
                <FaOrcid className="text-brwn dark:text-drka" />
              </a>
            )}
            {Research && (
              <a href={Research} target="_blank" rel="noopener noreferrer">
                <FaResearchgate className="text-brwn dark:text-drka" />
              </a>
            )}
            {Scopus && (
              <a href={Scopus} target="_blank" rel="noopener noreferrer">
                <FaBook className="text-brwn dark:text-drka" />
              </a>
            )}
          </div>
          <div>
         {isEdit && (<>
         {Scopus || Research || Orchid || Scholar || Linkedin || Publon ? (<button className="hover:text-prim bg-secd hover:bg-brwn px-2 py-2 rounded w-28"> Edit Links </button>) : (  <button className="hover:text-prim bg-secd hover:bg-brwn px-2 py-2 rounded w-28"> Add Links </button>) }
        
          </>)}
          </div>
        </div>

        <div className="flex flex-col justify-start gap-2">
        
       {!isEdit && (
          <button
          // onClick={() => navigate(`/facultyprofile/${uid}`)}
          onClick={() => {
            if (profile && profile.trim() !== "") {
              const url = UrlParser(profile);
              if (url) {
                window.open(url, "_blank", "noopener,noreferrer");
              }
            }
          }}
          className={styles.facButton + " bg-brwn hover:text-text dark:bg-drks hover:bg-secd text-prim dark:text-black"}>
          View More
        </button>
       )} 
      </div>  
    </div>
  </div>
  </>
)};

export default ImageCard;
