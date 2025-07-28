import React, { useEffect, useState } from "react";
import "./nirf.css";
import LoadComp from "../../LoadComp";

const NIRF = ({ data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // show offline message
  if (!isOnline) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp txt="You are offline" />
      </div>
    );
  }

  // if data is not yet available
  if (!data || data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <div className="nirf-page">
      <div className="nirf-intro dark:bg-drkb border-l-4 border-secd dark:border-drks">
        <h1 className="nirf-header text-brwn dark:text-drkt">
          NATIONAL INSTITUTIONAL RANKING FRAMEWORK (NIRF)
        </h1>
        <p>
          The NIRF is a comprehensive ranking system launched by the Ministry of
          Education, Government of India, in 2015. It provides a structured
          methodology to rank higher education institutions across India based
          on various objective and subjective criteria. The ranking is released
          annually, aiming to promote a competitive spirit among institutions
          and enhance transparency in education standards.
        </p>
      </div>

      <h2 className="nirf-title text-brwn dark:text-drkt">
        NATIONAL INSTITUTIONAL RANKING FRAMEWORK
      </h2>

      <div className="nirf-grid">
        {Array.isArray(data) && (
          <>
            {data
              ?.slice() // make a copy so original prop is not mutated
              ?.reverse()
              ?.map((item, index) => (
                <div key={index} className="nirf-year">
                  <h3 className="text-text dark:text-drkt">NIRF {item?.year}</h3>
                  {item?.content?.map((cat, catIndex) => (
                    <a
                      key={catIndex}
                      href={`${UrlParser(cat?.pdf_path)}#toolbar=0`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nirf-link dark:text-drka"
                    >
                      {cat?.name}
                    </a>
                  ))}
                </div>
              ))}
          </>
        )}
      </div>

      <p className="nirf-footer">
        Comments and suggestions are invited from the public to provide feedback
        through{" "}
        <a
          href="mailto:feedback.nirf@velammal.edu.in"
          className="nirf-email dark:text-drka"
        >
          feedback.nirf@velammal.edu.in
        </a>
      </p>
    </div>
  );
};

export default NIRF;
