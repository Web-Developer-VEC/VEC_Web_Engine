import { FaLink } from "react-icons/fa";

export default function IQauge() {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <div className="text-center py-10 dark:bg-drkp">
      <h1 className="text-2xl font-bold text-brwn dark:text-drkt mb-8">QS I QUAGE</h1>

      <div className="flex justify-center">
        <iframe
          src={UrlParser("/static/pdfs/qs+rating/QS+I-GAUGE+-+VEC+Certificate.pdf")}
          title="Main PDF"
          className="w-[60vw] h-[80vh] border-2 border-gray-300 shadow-md"
          loading="lazy"
        />
      </div>

      <a
        href={UrlParser("/static/pdfs/qs+rating/QS+I-GAUGE+-VEC+-+Scorecard.pdf")}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-6 dark:text-drka text-lg underline"
      >
        <FaLink className={"inline size-5 mr-1 mb-1"} />
        I QUAGE Score
      </a>
    </div>
  );
}