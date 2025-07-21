import"./Enterpreneur.css"
export default function EnterpreN() {
    const alumniData = [
        {
            sno: 1,
            name: "Mr. Velumani Narendran",
            batch: "2012-2016 (Mech)",
            company: "Aura Air – Conditioning And Ventilation",
            website: "http://auraairconditioning.in/",
            mobile: "9659195252"
        },
        {
            sno: 2,
            name: "Mr. Haresshvar Sakthivelu",
            batch: "2012-2016 (Mech)",
            company: "Radical Art Productions",
            website: "http://rapmedia.co/",
            mobile: "8056480662"
        },
        {
            sno: 3,
            name: "Mr. Aravind R",
            batch: "2013-2017 (Mech)",
            company: "Vetri Pressings Private Limited",
            website: "https://www.zaubacorp.com/company/vetri-pressings-private-limited/u29141tn2006ptc060509",
            mobile: "9566264568"
        },
        {
            sno: 4,
            name: "Mr. Rishanth S",
            batch: "2014-2018 (Mech)",
            company: "Stucor Technologies Private Limited",
            website: "https://www.tofler.in/stucor-technologies-private-limited/company/U80904TN2018PTC122890",
            mobile: "98846 61441"
        },
        {
            sno: 5,
            name: "Mr. Sudharson.M",
            batch: "2012-2016 (EIE)",
            company: "Tech Makerz",
            website: "http://www.techmakerz.com",
            mobile: "7397300685 / 9500062421"
        },
        {
            sno: 6,
            name: "Habib Rahman",
            batch: "2011-2015 (Civil)",
            company: "Al Wahaa Pools L.L.C, Dubai, UAE",
            website: "http://www.alwahaapools.com",
            mobile: "+971525652771"
        },
        {
            sno: 7,
            name: "Askar Ali R",
            batch: "2011-2015 (Civil)",
            company: "Qube Elevators Private Limited",
            website: "http://www.qubeelevators.com",
            mobile: "9600040007"
        },
        {
            sno: 8,
            name: "Manikandan K",
            batch: "2011-2015 (Civil)",
            company: "Edge Architecture & Construction",
            website: "http://www.edgearchitectureandconstructions.com",
            mobile: "9360708087"
        },
        {
            sno: 9,
            name: "Gurumoorthy.P",
            batch: "2011-2015 (Civil)",
            company: "Classik Interiors",
            website: "http://www.classikinteriors.in",
            mobile: "9659796740"
        },
        {
            sno: 10,
            name: "Vasanth M",
            batch: "2011-2015 (Civil)",
            company: "Classik Interiors",
            website: "http://www.classikinteriors.in",
            mobile: "9659796740"
        }
    ];

    return (
        <div className="container">
            
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Name of the Student</th>
                        <th>Batch</th>
                        <th>Name of the Company</th>
                        <th>Website of the Company</th>
                        <th>Mobile No.</th>
                    </tr>
                </thead>
                <tbody>
                    {alumniData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.sno}</td>
                            <td>{item.name}</td>
                            <td>{item.batch}</td>
                            <td>{item.company}</td>
                            <td>
                                <a href={item.website} target="_blank" rel="noopener noreferrer">
                                    {item.website}
                                </a>
                            </td>
                            <td>{item.mobile}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
