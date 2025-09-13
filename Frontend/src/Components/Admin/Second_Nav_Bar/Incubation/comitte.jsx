import LoadComp from "../../LoadComp";

export default function Committe ({data}) {
    return (
        <>
            {data ? (
                <div>
                    <>
                        <h2 className="text-2xl font-bold mb-6 mt-4 text-brwn dark:text-drkt text-center">
                            COMMITTEE MEMBERS
                        </h2>
                        <div className="flex flex-wrap justify-center gap-4 m-4">
                            {data?.map(faculty => (
                                <div key={faculty.id} className="student-card dark:bg-text h-[100px]">
                                    {/* <img src={faculty.image} className="w-[150px] h-[200px] m-auto" alt={faculty.name} /> */}
                                    <div className="ncc-n-stu-detail p-2 text-left">
                                        <h5 className="text-center">{faculty.name}</h5>
                                        {faculty.Designation && (
                                            <p className="pl-4 text-brwn dark:text-drka text-[14px]">{faculty.Designation}</p>
                                        )}
                                        <p className="pl-4 text-brwn dark:text-drka text-[14px]">{faculty.position}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                </div>
            ) : (
                <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
            )}
        </>
    )
}