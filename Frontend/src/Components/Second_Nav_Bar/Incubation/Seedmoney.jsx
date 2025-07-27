import LoadComp from "../../LoadComp";

export default function Seedmoney ({data}) {
    return (
        <>
            {data ? (
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
                            {data.map((startup, i) => (
                                <>
                                    {startup.funds.map((fund, index) => (
                                    <tr key={`${startup.slNo}-${index}`}>
                                        {index === 0 ? (
                                        <>
                                            <td rowSpan={startup.funds.length} className="ic-table-data">{i + 1}</td>
                                            <td rowSpan={startup.funds.length} className="ic-table-data">{startup.name}</td>
                                        </>
                                        ) : null}
                                        <td className="ic-table-data">{fund.amount_in_rupees}</td>
                                        <td className="ic-table-data">{fund.organization}</td>
                                        <td className="ic-table-data">{fund.year}</td>
                                    </tr>
                                    ))}
                                </>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
                    <LoadComp />
                </div>
            )}
        </>
    );
}