import { FaLink } from "react-icons/fa";
import "./igauge.css";
import LoadComp from "../../LoadComp";

export default function IQGauge({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    let paths
    if (typeof(path) == 'string') {
      paths = path?.startsWith("http") ? path : `${BASE_URL}${path}`
    }
    return paths;
  };

  if (!data && Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[10%] md:block">
        <LoadComp txt={""} />
      </div>
    )
  }

  return (
    <div className="text-center py-10 dark:bg-drkp">
      <h1 className="text-2xl font-bold text-brwn dark:text-drkt mb-8">QS I QUAGE</h1>

      <div className="w-full flex justify-center px-2 overflow-x-auto">
        <div className="iframe-wrapper">
          <iframe
            src={UrlParser(Array.isArray(data) && data[0]?.pdf_path)}
            title="Main PDF"
            className="responsive-iframe"
            loading="lazy"
          />
        </div>
      </div>

      {/* <a
        href={UrlParser(data[0]?.link)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-6 dark:text-drka text-lg underline"
      >
        <FaLink className="inline size-5 mr-1 mb-1" />
        I QUAGE Score
      </a> */}
    </div>
  );
}
