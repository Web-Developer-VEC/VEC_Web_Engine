export default function IicFacEvent({title}) {
  const eventsData = [
        {slNo: 1, name: "Innovative Methods of Industrial Automation in Manufacturing Systems", date: "19.08.2021", no_part: "123"},
    ];

    return (
        <div className="ic-table-container m-4">
            <div>
                <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">{title}</p>
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
                    {eventsData.map((event) => (
                        <tr key={event.slNo}>
                            <td className="ic-table-data">{event.slNo}</td>
                            <td className="ic-table-data">{event.name}</td>
                            <td className="ic-table-data">{event.date}</td>
                            <td className="ic-table-data">{event.no_part}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  }