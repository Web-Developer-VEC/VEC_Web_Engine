export default function Startup() {

    const startupsData = [
        {slNo: 1, groupName: "Vivid", leadName: "Mr. Shrinivas S, CSBS", regno: "LLP-AAZ-3585", year: "2021-2022"},
        {slNo: 2, groupName: "Green M", leadName: "Mr. Andrew Vikas, CSBS", regno: "LLP-AAZ-3586", year: "2021-2022"},
        {slNo: 3, groupName: "Coarve IT", leadName: "Mr. Jayadevan, Data Science (AMCS)", regno: "LLP-AAZ-3586", year: "2021-2022"},
        {slNo: 4, groupName: "Farm Far Away", leadName: "Mr. Muruganath", regno: "LLP-AAZ-3586", year: "2021-2022"},
        {slNo: 5, groupName: "Cataract prediction using transfer learning", leadName: "Ms. Dayalaxmi. S (IT)", regno: "LLP-AAZ-3586", year: "2021-2022"}
    ];

    return (
        <div className="ic-table-container m-4">
            <div>
                <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Start Up</p>
            </div>
            <div className="overflow-x-auto">
                <table className="ic-data-table">
                    <thead>
                    <tr>
                        <th className="ic-table-head border-2 border-text dark:border-prim">SL No</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Department</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Name of Venture/Startup</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">DPIIT/Start up India Reg No.</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Year of registration</th>
                    </tr>
                    </thead>
                    <tbody>
                    {startupsData.map((startup) => (
                        <tr key={startup.slNo}>
                            <td className="ic-table-data">{startup.slNo}</td>
                            <td className="ic-table-data">{startup.groupName}</td>
                            <td className="ic-table-data">{startup.leadName}</td>
                            <td className="ic-table-data">{startup.regno}</td>
                            <td className="ic-table-data">{startup.year}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}