import { useEffect, useState } from "react";
import "./warden.css";
import axios from "axios";
import LoadComp from "../../LoadComp";

export default function Warden({ hostelData}) {
  const [chief, setChief] = useState(null);
  const [chiefDeputy, setChiefDeputy] = useState(null);
  const [boysWardens, setBoysWardens] = useState([]);
  const [girlsWardens, setGirlsWardens] = useState([]);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    if (hostelData?.length > 0) {
      const wardenData = hostelData.find(item => item.category === "warden");
      const maleWardenData = hostelData.find(item => item.category === "male_warden");
      const femaleWardenData = hostelData.find(item => item.category === "female_warden");

      if (wardenData?.members?.length) {
        setChief(wardenData.members[0] || null);
        setChiefDeputy(wardenData.members[1] || null);
      }

      setBoysWardens(maleWardenData?.members || []);
      setGirlsWardens(femaleWardenData?.members || []);
    }
  }, [hostelData]);

  if (!chief || !chiefDeputy || boysWardens.length === 0 || girlsWardens.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      <h2 className="warden-heading1 text-brwn text-3xl font-bold  dark:text-drkt mt-10">Wardens</h2>

      {/* Chief and Deputy */}
      <div className="warden-top-column">
        {[chief, chiefDeputy].map((warden, index) => (
          <div key={index} className="warden-card-flex">
            <img src={UrlParser(warden?.image_path)} alt={warden?.warden_name} />
            <div className="warden-info">
              <p>{warden?.warden_name}</p>
              <p>{warden?.designation}</p>
              {warden?.phone_number && <a href={`tel:${warden.phone_number}`}>{warden.phone_number}</a>}
            </div>
          </div>
        ))}
      </div>

      {/* Boys Wardens */}
      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10">Boys Warden</h2>
      <div className="warden-row">
        {boysWardens.map((warden, index) => (
          <div key={index} className="warden-card-flex">
            <img src={UrlParser(warden?.image_path)} alt={warden?.warden_name} />
            <div className="warden-info">
              <p>{warden?.warden_name}</p>
              <p>{warden?.designation}</p>
              <a href={`tel:${warden?.phone_number}`}>{warden?.phone_number}</a>
            </div>
          </div>
        ))}
      </div>

      {/* Girls Wardens */}
      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10">Girls Warden</h2>
      <div className="warden-row">
        {girlsWardens.map((warden, index) => (
          <div key={index} className="warden-card-flex">
            <img src={UrlParser(warden?.image_path)} alt={warden?.warden_name} />
            <div className="warden-info">
              <p>{warden?.warden_name}</p>
              <p>{warden?.designation}</p>
              <a href={`tel:${warden?.phone_number}`}>{warden?.phone_number}</a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
