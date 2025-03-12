import Banner from '../../Banner'
import './Programmes.css'
import React from 'react'

const Programmes = (toggle, theme) => {

    const department = [
        {
            type: 'UGCourses',
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
                    name: 'B.E. Electronics and Instrumation Engineering',
                    lnk: '/dept/008'
                },
                {
                    name: 'Mechanical Engineering',
                    lnk: 'dept/013'
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
            type: 'Science and Humanities',
            values: [
                {
                    name: 'Computer Science and Engineering',
                    lnk: '/dept/002'
                },
                {
                    name: 'Information Technology',
                    lnk: '/dept/004'
                },
                {
                    name: 'Electronics and Communication Engineering',
                    lnk: '/dept/004'
                },
                {
                    name: 'Computer Science and Engineering',
                    lnk: '/dept/002'
                },
                {
                    name: 'Electrical and Electronics Engineering',
                    lnk: '/dept/004'
                },
                {
                    name: 'Mechanical Engineering',
                    lnk: '/dept/004'
                },
                {
                    name: 'Physics',
                    lnk: '/dept/004'
                },
            ]
        },
        {
            type: 'PGCourses',
            values: [
                {
                    name: 'M.E. Computer Science Engineering',
                    lnk: '/dept/002'
                },
                {
                    name: 'B.E. Power System Engineering',
                    lnk: '/dept/004'
                },
                {
                    name: 'M.B.A Master of Business Administration',
                    lnk: '/dept/004'
                },
            ]
        },
    ]

    return (
        <>
            <Banner toggle={toggle} theme={theme}
                backgroundImage="https://png.pngtree.com/thumb_back/fh260/background/20220620/pngtree-mountainous-road-with-the-word-mission-inscribed-vision-visionary-way-photo-image_31857844.jpg"
                headerText="Programmes"
                subHeaderText="Explore our diverse range of undergraduate and postgraduate programs designed for academic excellence and industry relevance."
            />
            <div className='programmes-page'>
                {
                    department.map((dept) => (
                        <div key={dept.type}>
                            <h4>{dept.type}</h4>
                            {
                                dept.values.map((data) => (
                                    <div className="programmes-name flex items-center" key={data.name}>
                                        <img src="/badge.png" alt="" /><a href={data.lnk}><p>{data.name}</p></a>
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