import { TfiControlBackward, TfiControlForward } from "react-icons/tfi";
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import "./iic.css"
import Banner from "../../Banner"
import SideNav from "../SideNav";
import LoadComp from "../../LoadComp";
import IICMentee from "./IICMentee";

import { IICFaculty, IICStudent } from "./IICFaculty";
import IICExpert from "./IICExpert";
// import IICStudent from "./IICStudent";

import KamalaBar from './KamalaBar';
import IICContact from "./IICContect";
import IicFacEvent from "./event";
import IicFacPolicy from "./policy";
import IicFacCertificate from "./certificates";
import IicFacnir from "./nir";
import { useNavigate } from "react-router";
import { div } from "framer-motion/m";
import IicHome from "./IicHome";
import IicEst from "./Establishment";




const getCategory = (dataArray, categoryName) => {
  return dataArray.find(item => item.category === categoryName)?.content || [];
};



function IicEco({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="card-plc functions-info-panel border-l-4 border-secd dark:border-drks dark:bg-drkb">
        <h1 className="text-accn dark:text-drkt text-4xl">I & E Ecosystem</h1>
        <h2 className="text-[30px] iic-eco">Functions of IIC</h2>
        <p className="text-justify">
          {data?.map((point, i) => (
            <span key={i}>
              <br />• {point}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}


const AdminIic = ({ toggle, theme }) => {
  const [iicData, setIicData] = useState(null)
  const navigate = useNavigate();
  const navData = {
    "Home": <IicHome data={iicData} />,
    "Establishment of IIC": <IicEst data={iicData} />,
    "Council": {
      "Faculty": <IICFaculty data={iicData} />,
      "Expert Representation": <IICExpert data={iicData} />,
      "Student Representation": <IICStudent data={iicData} />
    },

    "Event Organized": {
      "IIC 3.0": <IicFacEvent title={"IIC 3.0"} data={iicData} collectionType={"iic3"} />,
      "IIC 4.0": <IicFacEvent title={"IIC 4.0"} data={iicData} collectionType={"iic4"} />,
      "IIC 5.0": <IicFacEvent title={"IIC 5.0"} data={iicData} collectionType={"iic5"} />,
      'IIC 6.0': <IicFacEvent title={"IIC 6.0"} data={iicData} collectionType={"iic6"} />,
      'IIC 7.0': < IicFacEvent title={"IIC 7.0"} data={iicData} collectionType={"iic7"} />
    },
    "Kapila": <KamalaBar data={iicData} />,
    "Mentee Institution": <IICMentee data={iicData} />,
    "Yukti": <IicFacnir data={iicData} />,
    "Certificate": <IicFacCertificate data={iicData} />,
    "Policy": <IicFacPolicy data={iicData} />,
    "Contact": <IICContact data={iicData} />,
  }
  const [iic, setIic] = useState(Object.keys(navData)[0]);
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const typeMatch = {
      "Home": "home",
      "Establishment of IIC": "establishment",
      "Faculty": "faculty",
      "Expert Representation": "expert_representation",
      "Student Representation": "student_representation",
      "IIC 3.0": "iic3",
      "IIC 4.0": "iic4",
      "IIC 5.0": "iic5",
      "IIC 6.0": "iic6",
      "IIC 7.0": "iic7",
      "Kapila": "kapila",
      "Mentee Institution": "mentee",
      "Yukti": "yukti",
      "Certificate": "certificate",
      "Policy": "policy",
      "Contact": "contact"
    };


    const fetchData = async () => {
      try {
        const key = Array.isArray(iic) ? iic[iic.length - 1] : iic;
        const type = typeMatch[key];

        if (!type) {
          console.warn(`No match for key "${key}"`);
          return;
        }

        const response = await axios.post(`/api/main-backend/iic`, {
          type: type
        });

        setIicData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message } })
        }
        setLoading(true);
      }
    };

    fetchData();
  }, [iic]);


  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  useEffect(() => {
    document.body.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    document.documentElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
  }
  return (
    <div className="nirf-page">
      <Banner toggle={toggle} theme={theme}
        backgroundImage="./Banners/IIC.webp"
        headerText="IIC"
        subHeaderText="Instituition's Innovation Council"
      />

      {isLoading ? (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      ) : (
        <SideNav sts={iic} setSts={setIic} navData={navData} />
      )}

    </div>
  )
}

export default AdminIic