import React, { useEffect, useState } from 'react';
import axios from "axios";
import './PlacementTeam.css';
import Banner from '../../Banner';
import LoadComp from '../../LoadComp';
import { useNavigate } from "react-router";


function PersonDetail({ person, isImageLeft }) {
  
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  return (
    <div className={`person-detail ${isImageLeft ? 'left' : 'right'} dark:bg-drkts`}>
      <img src={UrlParser(person?.photo_path)} alt={person?.name} className="person-image" />
      <div className="person-content">
      <h3 className='placement-head'>{person?.name}</h3>
        <p className="text-accn dark:text-drka text-[24px]">{person?.designation}</p>
        <p>{person?.content}</p>
      </div>
    </div>
  );
}

function PersonMemberDetail({ person, isImageLeft }) {

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  return (
    <div className={`person-detail ${isImageLeft ? 'left' : 'right'} dark:bg-drkts`}>
      <img src={UrlParser(person.photo_path)} alt={person.name} className="person-image-mem" />
      <div className="person-content-mem">
        <h3 className='placement-member-head'>{person.name}</h3>
        <p className="text-accn dark:text-drka ">{person.designation}</p>
      </div>
    </div>
  );
}

export const PlacementTeam = ({toggle, theme}) => {

  const [PlacementTeam, setPlacementTeam] = useState([]);
  const [isLoading,setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`/api/main-backend/placement`,
          {
            type: "placement_team"
          }
        );

        setPlacementTeam(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        if (error.response.data.status === 429) {
          navigate('/ratelimit', { state: { msg: error.response.data.message}})
        }
        setLoading(true);
      } 
    };
    fetchData();
  },[]);

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

if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={"You are offline"} />
      </div>
    );
}

  return (

    <>
    <Banner toggle={toggle} theme={theme}
    backgroundImage="./Banners/placementbanner.webp"
    headerText="Placement Team"
    subHeaderText="Connecting talent with opportunity through strategic partnerships and career support services."
/>
    <div className='place-container'>
      <div className="Placement-App" style={{marginTop:'30px'}}>
        {/* Show loading spinner during data fetch */}
        {isLoading ? (
          <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
            <LoadComp txt={""} />
          </div>
          ) : (
            <>
              <PersonDetail key={PlacementTeam[0]?.name} person={PlacementTeam[0]} />

            <div className="placement-members">
              {PlacementTeam.slice(1).map((person, index) => (
                <PersonMemberDetail key={person.name} person={person} isImageLeft={index % 2 === 0} />
              ))}
            </div>
            
            </>
          )}

      </div>
    </div>
    </>
  );
}
