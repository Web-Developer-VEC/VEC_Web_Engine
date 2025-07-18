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
                const responce = await axios.get('/api/programmes_list');

                const data = responce.data;
                
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

    const department = [
        {
            type: 'UG Programmes',
            values: [
                {
                    name: 'B.E. Automobile Engineering',
                    lnk: '/dept/002'
                },
                {
                    name: 'B.E. Civil Engineering',
                    lnk: '/dept/004'
                },
                {
                    name: 'B.E. Computer Science and Engineering',
                    lnk: '/dept/005'
                },
                {
                    name: 'B.E. Computer Science and Engineering (Cyber Security)',
                    lnk: '/dept/006'
                },
                {
                    name: 'B.E. Electrical and Electronics Engineering',
                    lnk: '/dept/007'
                },
                {
                    name: 'B.E. Electronics and Communication Engineering',
                    lnk: '/dept/009'
                }, 
                {
                    name: 'B.E. Electronics and Instrumentation Engineering',
                    lnk: '/dept/008'
                },
                {
                    name: 'B.E. Mechanical Engineering',
                    lnk: '/dept/013'
                },
                {
                    name: 'B.Tech. Artificial Intelligence and Data Science',
                    lnk: '/dept/001'
                },
                {
                    name: 'B.Tech. Information Technology',
                    lnk: '/dept/011'
                },
            ]
        },
        {
            type: 'PG Programmes',
            values: [
                {
                    name: 'M.E. Computer Science Engineering',
                    lnk: '/dept/005'
                },
                {
                    name: 'M.E. Power Systems Engineering',
                    lnk: '/dept/007'
                },
                {
                    name: 'M.B.A Master of Business Administration',
                    lnk: '/dept/017'
                },
            ]
        },
        {
            type: "Ph.D - Programmes",
            values: [
                {
                    name: 'Computer Science and Engineering',
                    lnk: '/dept/005'
                },
                {
                    name: 'Electrical and Electronics Engineering',
                    lnk: '/dept/007'
                },
                {
                    name: 'Electronics and Communication Engineering',
                    lnk: "/dept/009"
                },
                {
                    name: 'Information Technology',
                    lnk: '/dept/011'
                },
                {
                    name: 'Mechanical Engineering',
                    lnk: '/dept/013'
                },
                {
                    name: 'Physics',
                    lnk: '/dept/015'
                }
            ]
        }
    ]

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
            <div className='programmes-page bg-prim dark:bg-drkts'>
                {
                    department.map((dept) => (
                        <div key={dept.type}>
                            <h4 className='text-brwn dark:text-prim'>{dept.type}</h4>
                            {
                                dept.values.map((data) => (
                                    <div className="programmes-name flex items-center " key={data.name}>
                                        <img src="/badge.png" alt="" /><a href={data.lnk} className='text=[#2980b9] dark:text-drka'><p>{data.name}</p></a>
                                    </div>
                                ))
                            }
                        </div>
                    ))
                }
                
            </div>
        </>
    )
}

export default Programmes;