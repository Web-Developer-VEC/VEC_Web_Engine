export default function Seedmoney () {
    const startupsData = [
        {slNo: 1, name: "Vivid", funding: "₹10,00,000",nameOrg: "MSME", year: "2021-2022"},
        {slNo: 2, name: "Green M", funding: "₹15,00,000",nameOrg: "MSME", year: "2021-2022"},
        {slNo: 3, name: "Coarve IT", funding: "₹20,00,000",nameOrg: "MSME", year: "2021-2022"},
        {slNo: 4, name: "Farm Far Away", funding: "₹25,00,000",nameOrg: "MSME", year: "2021-2022"},
        {slNo: 5, name: "Cataract prediction using transfer learning", funding: "₹30,00,000",nameOrg: "MSME", year: "2021-2022"}
    ];

    return (
        <div className="ic-table-container m-4">
            <div>
                <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Seed Money</p>
            </div>
            <div className="overflow-x-auto">
                <table className="ic-data-table">
                    <thead>
                    <tr>
                        <th className="ic-table-head border-2 border-text dark:border-prim">SL No</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Name</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Seed funding received</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Name of Government Organization </th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Year of registration</th>
                    </tr>
                    </thead>
                    <tbody>
                    {startupsData.map((startup) => (
                        <tr key={startup.slNo}>
                            <td className="ic-table-data">{startup.slNo}</td>
                            <td className="ic-table-data">{startup.name}</td>
                            <td className="ic-table-data">{startup.funding}</td>
                            <td className="ic-table-data">{startup.nameOrg}</td>
                            <td className="ic-table-data">{startup.year}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}