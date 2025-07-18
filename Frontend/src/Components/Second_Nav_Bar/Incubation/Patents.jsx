export default function Patents () {
    const patentsData = [
        {
            slNo: 1,
            applicationNo: "201941046721",
            status: "Published",
            inventorName: "DR.S.MARY JOANS",
            title: "Augmented Reality And Internet Of Things Supported Monitoring System",
            applicantName: "Newgen IEDC of Velammal Engineering College",
            date: "21/05/2021"
        },
        {
            slNo: 1,
            applicationNo: "201941046721",
            status: "Published",
            inventorName: "DR.S.MARY JOANS",
            title: "Augmented Reality And Internet Of Things Supported Monitoring System",
            applicantName: "Newgen IEDC of Velammal Engineering College",
            date: "21/05/2021"
        },
        {
            slNo: 1,
            applicationNo: "201941046721",
            status: "Published",
            inventorName: "DR.S.MARY JOANS",
            title: "Augmented Reality And Internet Of Things Supported Monitoring System",
            applicantName: "Newgen IEDC of Velammal Engineering College",
            date: "21/05/2021"
        },
        {
            slNo: 1,
            applicationNo: "201941046721",
            status: "Published",
            inventorName: "DR.S.MARY JOANS",
            title: "Augmented Reality And Internet Of Things Supported Monitoring System",
            applicantName: "Newgen IEDC of Velammal Engineering College",
            date: "21/05/2021"
        },
    ];


    return (
        <div className="ic-table-container m-4">
            <div>
                <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Patents</p>
            </div>
            <div className="overflow-x-auto">
                <table className="ic-data-table">
                    <thead>
                    <tr>
                        <th className="ic-table-head border-2 border-text dark:border-prim">SL No</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Patent Application No</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Status of Patent </th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Inventor's Name</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Title of the Patent</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Applicant's Name</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Published date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {patentsData.map((startup) => (
                        <tr key={startup.slNo}>
                            <td className="ic-table-data">{startup.slNo}</td>
                            <td className="ic-table-data">{startup.applicationNo}</td>
                            <td className="ic-table-data">{startup.status}</td>
                            <td className="ic-table-data">{startup.inventorName}</td>
                            <td className="ic-table-data">{startup.title}</td>
                            <td className="ic-table-data">{startup.applicantName}</td>
                            <td className="ic-table-data">{startup.date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}