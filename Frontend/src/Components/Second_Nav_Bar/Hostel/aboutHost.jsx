  import "./aboutHost.css"
  import hostel from'../../Assets/hostel.jpg';
import LoadComp from "../../LoadComp";


  export default function AboutHostel ( {hostelData}) {

    let data;
    if (hostelData) {
      data = hostelData[0]
    }

    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
    return path?.startsWith("http") ? path :`${BASE_URL}${path}`;
  };
      return (
      <>
      {data ? (
        <section className="about-hostel w-full max-w-7xl mx-auto p-4">
          <h2 className="about-hostel-heading text-center text-3xl font-bold mb-4 text-brwn dark:text-drkt">About Our Hostel</h2>

          <div className="hostel-abt-container flex flex-col md:flex-row items-center justify-center gap-6">
            <p className="hostel-about-para text-justify border-l-4 border-secd dark:border-drks p-4 rounded-md md:w-1/2 w-full dark:bg-drkb">
              {data?.about_us}
            </p>

            <div className="hostel-about-image md:w-1/2 w-full flex justify-center">
              <img src={UrlParser(data?.image_path)} alt="hostel building " className="w-full max-w-xs md:max-w-md object-cover rounded" />
            </div>
          </div>
        </section>
      ) : (
          <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
            <LoadComp />
          </div>
      )}

          </>
      )
  }