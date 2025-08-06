import "./Eactivity.css";
import LoadComp from "../../LoadComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const EcellActivity = ({ year, pdfspath }) => (
  <a
    href={UrlParser(pdfspath)}
    target="_blank"
    className="flex items-center justify-center gap-2 px-6 py-4 
               rounded-lg bg-prim dark:bg-drkb border-2 border-secd dark:border-drks text-text dark:text-prim text-lg font-medium
               hover:bg-yellow-600 shadow-md transition-all duration-200 no-underline cursor-pointer"
    >
    <FontAwesomeIcon icon={faBook} className="text-secd dark:text-drks" />
    {year}
  </a>
);

export default function ImageGallery({ activity }) {

if (!Array.isArray(activity)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
}

  return (
    <>
      {activity ? (
          <div className="flex flex-col items-center my-12 px-4">
            <h2 className="text-[32px] font-semibold mb-8 text-brwn dark:text-drkt">
              E-Cell Activities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-center items-center">
              {Array.isArray(activity) && activity?.map((year, idx) => (
                <EcellActivity
                  key={idx}
                  year={year?.year}
                  pdfspath={`${year?.pdf_path ? UrlParser(year?.pdf_path) : '#'}`}
                />
              ))}
            </div>
          </div>
      ) : (
        <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
          <LoadComp txt={""} />
        </div>
      )}
    </>
  );
}
