import { motion } from "framer-motion";
import { useRef } from "react";
import "./warden.css";

const wardenHierarchy = {
  chief: { name: "Dr. John Doe", role: "Chief Warden", phone: "+91 9876543210", img: "https://tse1.mm.bing.net/th?id=OIP.lD19wIHMpdwwXX5kkP-kCQHaHa&pid=Api&P=0&h=220" },
  deputy: { name: "Ms. Jane Smith", role: "Deputy Warden", phone: "+91 9876543211", img: "https://tse1.mm.bing.net/th?id=OIP.lD19wIHMpdwwXX5kkP-kCQHaHa&pid=Api&P=0&h=220" },
  boysWardens: [
    { name: "Mr. Alex", role: "Boys 2nd Year Warden", phone: "+91 9876543212", img: "https://tse1.mm.bing.net/th?id=OIP.lD19wIHMpdwwXX5kkP-kCQHaHa&pid=Api&P=0&h=220" },
    { name: "Mr. Brian", role: "Boys 3rd year Warden", phone: "+91 9876543213", img: "https://tse1.mm.bing.net/th?id=OIP.lD19wIHMpdwwXX5kkP-kCQHaHa&pid=Api&P=0&h=220" },
    { name: "Mr. Charles", role: "Boys 4th year warden", phone: "+91 9876543214", img: "https://tse1.mm.bing.net/th?id=OIP.lD19wIHMpdwwXX5kkP-kCQHaHa&pid=Api&P=0&h=220" },
  ],
  girlsWardens: [
    { name: "Ms. Daisy", role: "Girls 3rd year Warden", phone: "+91 9876543215", img: "https://tse1.mm.bing.net/th?id=OIP.lD19wIHMpdwwXX5kkP-kCQHaHa&pid=Api&P=0&h=220" },
    { name: "Ms. Eva", role: "Girls 4rd year Warden", phone: "+91 9876543216", img: "https://tse1.mm.bing.net/th?id=OIP.lD19wIHMpdwwXX5kkP-kCQHaHa&pid=Api&P=0&h=220" },
  ],
};

export default function Warden() {

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
        <img src={wardenHierarchy.chief.img} alt={wardenHierarchy.chief.name} />
        <h3>{wardenHierarchy.chief.name}</h3>
        <p>{wardenHierarchy.chief.role}</p>
        <a href={`tel:${wardenHierarchy.chief.phone}`}>{wardenHierarchy.chief.phone}</a>
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
        <img src={wardenHierarchy.deputy.img} alt={wardenHierarchy.deputy.name} />
        <h3>{wardenHierarchy.deputy.name}</h3>
        <p>{wardenHierarchy.deputy.role}</p>
        <a href={`tel:${wardenHierarchy.deputy.phone}`}>{wardenHierarchy.deputy.phone}</a>
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
            {wardenHierarchy.boysWardens.map((warden, index) => (
              <motion.div 
                key={index} 
                className="warden-card"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.3 + index * 0.2 }}
              >
                <img src={warden.img} alt={warden.name} />
                <h3>{warden.name}</h3>
                <p>{warden.role}</p>
                <a href={`tel:${warden.phone}`}>{warden.phone}</a>
              </motion.div>
            ))}

          </div>
        </div>

        <div className="wardens">
            <h2>Girls Warden</h2>
          <div className="girls-wardens">
            {wardenHierarchy.girlsWardens.map((warden, index) => (
              <motion.div 
                key={index} 
                className="warden-card"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.3 + index * 0.2 }}
              >
                <img src={warden.img} alt={warden.name} />
                <h3>{warden.name}</h3>
                <p>{warden.role}</p>
                <a href={`tel:${warden.phone}`}>{warden.phone}</a>
              </motion.div>
            ))}

          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
