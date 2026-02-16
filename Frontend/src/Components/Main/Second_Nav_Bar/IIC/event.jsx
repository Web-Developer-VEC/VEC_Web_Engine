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
                        <tr className="bg-gry">
                            <th className="ic-table-head border-2 border-text dark:border-prim px-4 py-3">SL No</th>
                            <th className="ic-table-head border-2 border-text dark:border-prim px-4 py-3">Name of the program</th>
                            <th className="ic-table-head border-2 border-text dark:border-prim px-4 py-3">Date</th>
                            <th className="ic-table-head border-2 border-text dark:border-prim px-4 py-3">Number of Participants</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data?.map((event,i) => (
                            <tr key={event.slNo}>
                                <td className="ic-table-data px-4 py-3 border-2 border-text dark:border-prim">{i+1}</td>
                                <td className="ic-table-data text-left px-4 py-3 border-2 border-text dark:border-prim">{event.name_of_the_program}</td>
                                <td className="ic-table-data text-center px-4 py-3 border-2 border-text dark:border-prim">{event.date}</td>
                                <td className="ic-table-data text-center px-4 py-3 border-2 border-text dark:border-prim">{event.number_of_participants}</td>
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