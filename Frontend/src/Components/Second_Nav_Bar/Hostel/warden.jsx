import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "./warden.css";
import axios from "axios";

export default function Warden() {

  const [chief, setChief] = useState(null);
  const [chiefDeputy, setChiefDeputy] = useState(null);
  const [boysWardens, setBoysWarden] = useState(null);
  const [girlsWardens, setGirlsWardens] = useState(null);

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

  return (
    <>
    <h2 className="mt-10">Wardens</h2>

    <div className="tree-container">
      {/* Chief Warden */}
      <motion.div 
        className="warden-card chief-warden"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <img src={chief?.image_path} alt={chief?.warden_name} />
        <h3>{chief?.warden_name}</h3>
        <p>{chief?.designation}</p>
        <a href={`tel:${chief?.phone_number}`}>{chief?.phone_number}</a>
      </motion.div>

      {/* Growing Line */}
      <motion.div 
        className="line" 
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
        <img src={chiefDeputy?.image_path} alt={chiefDeputy?.warden_name} />
        <h3>{chiefDeputy?.warden_name}</h3>
        <p>{chiefDeputy?.designation}</p>
        <a href={`tel:${chiefDeputy?.phone_number}`}>{chiefDeputy?.phone_number}</a>
      </motion.div>

      {/* Growing Line */}
      <motion.div 
        className="line" 
        initial={{ height: 0 }}
        whileInView={{ height: 50 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
            {/* 🔹 NEW: Horizontal Line Splitting to Boys & Girls Wardens */}
      <motion.div
        className="line horizontal mid-line"
        initial={{ width: 0 }}
        whileInView={{ width: window.innerWidth > 768 ? 650 : "60vw" }}
        transition={{ duration: 1, delay: 1.1 }}
      ></motion.div>

      <div className="line-container">
        <motion.div 
          className="line1" 
          initial={{ height: 0 }}
          whileInView={{ height: 50 }}
          transition={{ duration: 1, delay: 1.8 }}
        />
        <motion.div 
          className="line2" 
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
        <div className="wardens">
          <h2>Boys Warden</h2>

          <div className="boys-wardens">
            {boysWardens?.male_warden_list?.map((warden, index) => (
              <motion.div 
                key={index} 
                className="warden-card"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.3 + index * 0.2 }}
              >
                <img src={warden?.image_path} alt={warden?.warden_name} />
                <h3>{warden?.warden_name}</h3>
                <p>{warden?.designation}</p>
                <a href={`tel:${warden?.phone_number}`}>{warden?.phone_number}</a>
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
                <img src={warden?.image_path} alt={warden?.warden_name} />
                <h3>{warden?.warden_name}</h3>
                <p>{warden?.designation}</p>
                <a href={`tel:${warden?.phone_number}`}>{warden?.phone_number}</a>
              </motion.div>
            ))}

          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
