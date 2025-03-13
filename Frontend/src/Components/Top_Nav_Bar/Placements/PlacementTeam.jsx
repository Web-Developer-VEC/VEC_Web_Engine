import React, { useEffect, useState } from 'react';
import axios from "axios";
import './PlacementTeam.css';
import Banner from '../../Banner';


function PersonDetail({ person, isImageLeft }) {

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  
  return (
    <div className={`person-detail border-2 border-secd dark:border-drks ${isImageLeft ? 'left' : 'right'}`}>
      <img src={UrlParser(person.photo_path)} alt={person.name} className="person-image" />
      <div className="person-content">
        <h2 className="text-accn dark:text-drka">{person.designation}</h2>
        <h3>{person.name}</h3>
        <p>{person.content}</p>
      </div>
    </div>
  );
}

export const PlacementTeam = ({toggle, theme}) => {

  const [PlacementTeam, setPlacementTeam] = useState([]);
  const [isLoading,setLoading] = useState(true);
  const content = PlacementTeam[0]?.placement_team || [];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/placementteam`);
        console.log("HI",response.data);

        setPlacementTeam(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setLoading(true);
      } 
    };
    fetchData();
  },[]);

  return (

    <>
    <Banner toggle={toggle} theme={theme}
    backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
    headerText="Placement Team"
    subHeaderText="Connecting talent with opportunity through strategic partnerships and career support services."
/>
    <div className='container'>
      <div className="Placement-App" style={{marginTop:'30px'}}>
        {/* Show loading spinner during data fetch */}
        {isLoading && (
            <div className="loading-screen">
              <div className="spinner"></div>
              Loading...
            </div>
          )}
        {content.map((person, index) => (
          <PersonDetail key={person.name} person={person} isImageLeft={index % 2 === 0} />
        ))}
      </div>
    </div>
    </>
  );
}
