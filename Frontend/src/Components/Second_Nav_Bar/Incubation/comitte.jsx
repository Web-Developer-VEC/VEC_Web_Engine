export default function Committe () {

    const incubCommitteeData = [
        {
            name: "Dr. S. Karthikeyan",
            image: "/icc1.jpg",
            designation: "Professor and Head",
            position: "Chairman",
        },
        {
            name: "Dr. S. Karthikeyan",
            image: "/icc1.jpg",
            designation: "Professor and Head",
            position: "Chairman",
        },
        {
            name: "Dr. S. Karthikeyan",
            image: "/icc1.jpg",
            designation: "Professor and Head",
            position: "Chairman",
        },
    ]
    return (
        <div>
            <>
                <h2 className="yrc-h3">
                    COMMITTEE MEMBERS
                </h2>
                <div className="flex flex-wrap justify-center gap-4 m-4">
                    {incubCommitteeData.map(faculty => (
                        <div key={faculty.id} className="student-card dark:bg-text">
                        {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} /> */}
                        <div className="ncc-n-stu-detail p-2 text-left">
                            <h5 className="text-center">{faculty.name}</h5>
                            <p className="pl-4 text-brwn dark:text-drka text-[14px]">Designation : {faculty.designation}</p>
                        
                            <p className="pl-4 text-brwn dark:text-drka text-[14px]">Position : {faculty.position}</p>
                        </div>
                        </div>
                    ))}
                </div>
            </>
        </div>
    )
}