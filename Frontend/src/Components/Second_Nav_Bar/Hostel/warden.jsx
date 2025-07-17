import { useEffect, useState } from "react";
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
        const response = await axios.get(`/api/warden`);
        const data = response.data.wardens;
        setChief(data[0]);
        setChiefDeputy(data[1]);
        setBoysWarden(data[2]);
        setGirlsWardens(data[3]);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    fetchData();
  }, []);

  if (!chief || !chiefDeputy || !girlsWardens || !boysWardens) {
    return (
      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
        <LoadComp />
      </div>
    );
  }

  return (
    <>
      <h2 className="warden-heading1 text-brwn dark:text-drkt mt-10 uppercase">Wardens</h2>

      {/* Chief and Deputy */}
      <div className="warden-top-column">
        <div className="warden-card-flex">
          <img src={UrlParser(chief?.image_path)} alt={chief?.warden_name} />
          <div className="warden-info">
            <p>{chief?.warden_name}</p>
            <p>{chief?.designation}</p>
            <a href={`tel:${chief?.phone_number}`}>{chief?.phone_number}</a>
          </div>
        </div>

        <div className="warden-card-flex">
          <img src={UrlParser(chiefDeputy?.image_path)} alt={chiefDeputy?.warden_name} />
          <div className="warden-info">
            <p>{chiefDeputy?.warden_name}</p>
            <p>{chiefDeputy?.designation}</p>
            <a href={`tel:${chiefDeputy?.phone_number}`}>{chiefDeputy?.phone_number}</a>
          </div>
        </div>
      </div>


      {/* Boys Warden Section */}
      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10 uppercase">Boys Warden</h2>
      <div className="warden-row">
        {boysWardens?.male_warden_list?.map((warden, index) => (
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

      {/* Girls Warden Section */}
      <h2 className="warden-section-title text-brwn dark:text-drkt mt-10 uppercase">Girls Warden</h2>
      <div className="warden-row">
        {girlsWardens?.female_warden_list?.map((warden, index) => (
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
