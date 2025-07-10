import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "./warden.css";
import axios from "axios";
import LoadComp from "../../LoadComp";

export default function Warden() {

  const [chief, setChief] = useState(null);
  const [chiefDeputy, setChiefDeputy] = useState(null);
  const [boysWardens, setBoysWarden] = useState(null);
  const [girlsWardens, setGirlsWardens] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/warden`)
        const data = response.data.wardens
        setChief(data[0]);
        setChiefDeputy(data[1]);
        setBoysWarden(data[2]);
        setGirlsWardens(data[3]);
      } catch (error) {
        console.error("Error fetching data:", error.message)

      }
    }
    fetchData()
  }, []);
   if (!setChief && setChiefDeputy && setGirlsWardens && setBoysWarden) {
      return (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
            <LoadComp />
          </div>
      );
    }

  return (
    <>
    <h2 className="warden-heading1 text-brwn dark:text-drkt mt-10">Wardens</h2>

    <div className="tree-container">
      {/* Chief Warden */}
      <motion.div 
        className="warden-card chief-warden"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <img src={UrlParser(chief?.image_path)} alt={chief?.warden_name} />
        <p>{chief?.warden_name}</p>
        <p>{chief?.designation}</p>
        <a href={`tel:${chief?.phone_number}`} className="dark:text-drka">{chief?.phone_number}</a>
      </motion.div>

      {/* Growing Line */}
      <motion.div 
        className="line bg-text dark:bg-drkt"
        initial={{ height: 0 }}
        whileInView={{ height: 50 }}
        transition={{ duration: 1, delay: 0.5 }}
      />

      {/* Deputy Warden */}
      <motion.div 
        className="warden-card deputy-warden"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <img src={UrlParser(chiefDeputy?.image_path)} alt={chiefDeputy?.warden_name} />
        <p>{chiefDeputy?.warden_name}</p>
        <p>{chiefDeputy?.designation}</p>
        <a href={`tel:${chiefDeputy?.phone_number}`} className="dark:text-drka">{chiefDeputy?.phone_number}</a>
      </motion.div>

      {/* Growing Line */}
      <motion.div 
        className="line bg-text dark:bg-drkt"
        initial={{ height: 0 }}
        whileInView={{ height: 50 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
            {/* 🔹 NEW: Horizontal Line Splitting to Boys & Girls Wardens */}
      <motion.div
        className="line bg-text dark:bg-drkt horizontal mid-line"
        initial={{ width: 0 }}
        whileInView={{ width: window.innerWidth > 768 ? 650 : "60vw" }}
        transition={{ duration: 1, delay: 1.1 }}
      ></motion.div>

      <div className="line-container">
        <motion.div 
          className="line1 bg-text dark:bg-drkt"
          initial={{ height: 0 }}
          whileInView={{ height: 50 }}
          transition={{ duration: 1, delay: 1.8 }}
        />
        <motion.div 
          className="line2 bg-text dark:bg-drkt"
          initial={{ height: 0 }}
          whileInView={{ height: 50 }}
          transition={{ duration: 1, delay: 1.8 }}
        />
      </div>

      {/* Wardens (Boys on Left, Girls on Right) */}
      <motion.div 
        className="warden-group"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.7 }}
      >
        <div className=" wardens">
          <h2 className="">Boys Warden</h2>

          <div className="boys-wardens">
            {boysWardens?.male_warden_list?.map((warden, index) => (
              <motion.div 
                key={index} 
                className="warden-card"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.3 + index * 0.2 }}
              >
                <img src={UrlParser(warden?.image_path)} alt={warden?.warden_name} />
                <p>{warden?.warden_name}</p>
                <p>{warden?.designation}</p>
                <a href={`tel:${warden?.phone_number}`} className="dark:text-drka">{warden?.phone_number}</a>
              </motion.div>
            ))}

          </div>
        </div>

        <div className="wardens">
            <h2>Girls Warden</h2>
          <div className="girls-wardens">
            {girlsWardens?.female_warden_list?.map((warden, index) => (
              <motion.div 
                key={index} 
                className="warden-card"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.3 + index * 0.2 }}
              >
                <img src={UrlParser(warden?.image_path)} alt={warden?.warden_name} />
                <p>{warden?.warden_name}</p>
                <p>{warden?.designation}</p>
                <a href={`tel:${warden?.phone_number}`} className="dark:text-drka">{warden?.phone_number}</a>
              </motion.div>
            ))}

          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
