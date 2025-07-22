export default function Startup({data}) {

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
                        <th className="ic-table-head border-2 border-text dark:border-prim">Startup Name</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Directors</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Type</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Date of Regestration</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Corporate Identity Data</th>
                        <th className="ic-table-head border-2 border-text dark:border-prim">Udyam Number</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data?.map((startup,i) => (
                        <tr key={startup.slNo}>
                            <td className="ic-table-data">{startup.s_no}</td>
                            <td className="ic-table-data">{startup.start_up_name}</td>
                            <td className="ic-table-data">
                                <ul>
                            {startup.directors.map((dir,i) => (
                                <li>{dir}</li>
                            ))}
                            </ul>
                            </td>
                            {startup.type ? (
                                <td className="ic-table-data">{startup.type}</td>
                            ) : (
                                <td className="ic-table-data">-</td>
                            )}
                            {startup.date_of_registration ? (
                                <td className="ic-table-data">{startup.date_of_registration}</td>
                            ) : (
                                <td className="ic-table-data">-</td>
                            )}
                            {startup.corporate_identity_number ? (
                                <td className="ic-table-data">{startup.corporate_identity_number}</td>
                            ) : (
                                <td className="ic-table-data">-</td>
                            )}
                            {startup.udyam_number ? (
                                <td className="ic-table-data">{startup.udyam_number}</td>
                            ) : (
                                <td className="ic-table-data">-</td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}