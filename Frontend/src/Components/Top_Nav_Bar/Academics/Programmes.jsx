import Banner from '../../Banner'
import './Programmes.css'
import React, { useEffect, useState } from 'react'
import LoadComp from "../../LoadComp";
import axios from "axios";

const Programmes = ({toggle, theme}) => {

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [programmes, setProgrammes] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responce = await axios.post('/api/main-backend/academics',
                    {
                        type: "programmes_list"
                    }
                );

                const data = responce.data.data
                console.log("Program",data);
                
                
                setProgrammes(data);
                
            } catch (error) {
                console.error("Error fetching programmes data",error);
            }
        }
        fetchData();
    })

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
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp txt={"You are offline"} />
          </div>
        );
    }

    return (
        <>
        <Banner toggle={toggle} theme={theme}
            backgroundImage="./Banners/academicsbanner.webp"
            headerText="Programmes"
            subHeaderText="Explore our diverse range of undergraduate and postgraduate programs designed for academic excellence and industry relevance."
        />
        {programmes ? (
            <>
                <div className='programmes-page bg-prim dark:bg-drkts'>
                    {
                        programmes?.map((dept,i) => (
                            <div key={i}>
                                <h4 className='text-brwn dark:text-prim'>{dept.category}</h4>
                                {
                                    dept?.content?.map((data) => (
                                        <div className="programmes-name flex items-center " key={data.name}>
                                            <img src="/badge.png" alt="" /><a href={data.link} className='text=[#2980b9] dark:text-drka'><p>{data.name}</p></a>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                    
                </div>
            </>
        ) : (
            <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
                <LoadComp txt={""} />
            </div>
        )}
        </>
    )
}

export default Programmes;