import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Gallery.css";
import Banner from "../../Banner";
import axios from "axios";
import LoadComp from "../../LoadComp"

const Gallery = ({ toggle, theme}) => {
  const navigate = useNavigate();

  const [gallery, setGallery] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
      return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.get('/api/gallery');
        
        const data = response.data[0];
        

        setGallery(data);

        
        
      } catch (error) {
        console.error("Error fetching gallery data",error);
      }
    }
    
    fetchdata();
  },[])

  const handleReadMore = (images) => {
    navigate(`/gallery-details`, { state: { imagespath: images}});

  };

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
    }, []);



    if (!isOnline) {
        return (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
     }

  let obj = []

  if (gallery) {
    obj = Object.keys(gallery);
  }

  return (
    <>
    {gallery ? (
      <>
          <Banner toggle={toggle} theme={theme}
            backgroundImage="./Banners/Gallery.webp"            
            headerText="Gallery"
            subHeaderText="Some pics of velammal Engineering Collage"
          />
          <div className="gallery-container overflow-y-auto">
            <h1 className="gallery-title text-brwn dark:text-drkt">Gallery</h1>
            <div className="gallery-grid1">
              {obj?.slice(1).map((img) => (

                  <div key={img.id} className="gallery-card">
                    <img src={UrlParser(gallery[img]?.image_path[0])} alt={img} className="gallery-image" />
                    <div className="gallery-content">
                      <h2 className="gallery-title-text">{img}</h2>
                      <button
                        className="read-more-button bg-secd dark:bg-drks"
                        onClick={() => handleReadMore(gallery[img]?.image_path)}
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
      </>
    ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    )}
    </>
  );
};

export default Gallery;
