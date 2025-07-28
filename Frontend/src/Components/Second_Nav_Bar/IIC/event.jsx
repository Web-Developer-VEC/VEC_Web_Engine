import LoadComp from "../../LoadComp";

export default function IicFacEvent({title, data}) {
    return (
        <>
            {(data && title) ? (
            <div className="ic-table-container m-4">
                <div>
                    <h2 className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">{title}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="ic-data-table">
                        <thead>
                        <tr>
                            <th className="ic-table-head border-2 border-text dark:border-prim">SL No</th>
                            <th className="ic-table-head border-2 border-text dark:border-prim">Name of the program</th>
                            <th className="ic-table-head border-2 border-text dark:border-prim">Date</th>
                            <th className="ic-table-head border-2 border-text dark:border-prim">Number of Participants</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data?.map((event,i) => (
                            <tr key={event.slNo}>
                                <td className="ic-table-data">{i+1}</td>
                                <td className="ic-table-data">{event["name of the program"]}</td>
                                <td className="ic-table-data">{event.date}</td>
                                <td className="ic-table-data">{event["Number of Participants"]}</td>
                            </tr>
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