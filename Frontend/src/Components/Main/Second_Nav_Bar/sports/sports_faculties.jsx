import React from 'react';
import LoadComp from '../../LoadComp';
import '../sports/Sportshod.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UrlParser = (path) => {
  return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
};

const Sportsfaculties = ({ data }) => {
  return (
    <section className="sports-faculty-section px-4 py-6 flex flex-col items-center">
      <h2 className="section-title text-brwn dark:text-drkt text-center text-3xl font-bold mb-8">
        Sports Faculties
      </h2>

      <div className="w-full flex justify-center">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
    {data?.map((faculty, index) => (
      <div
        key={index}
        className="bg-white dark:bg-drkb rounded-xl shadow-lg p-4 text-center max-w-[300px]"
      >
        <img
          src={UrlParser(faculty.image_path)}
          alt={faculty.name}
          className="w-full h-64 object-cover rounded-md mb-4"
        />
        <h3 className="text-xl font-semibold text-brwn dark:text-white mb-1">
          {faculty.name}
        </h3>
        <p className="text-[16px] text-drka dark:text-neutral-300">
          {faculty.qualification}
        </p>
        <p className="text-brwn dark:text-drka text-[18px] font-medium mt-1">
          {faculty.designation}
        </p>
      </div>
    ))}
  </div>
</div>


    </section>
  );
};

const SportsHOD = ({ data }) => {
  const hod = data?.[0];

  if (!hod) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }

  return (
    <article className="SportsHOD-container">
      <div className="Sports-HOD">
        <img src={UrlParser(hod.image_path)} alt={hod.name || "Sports HOD"} />
      </div>
      <br />
      <div className="SportsHOD-details">
        <div className="SportsHODNameAndqualification text-2xl font-semibold text-center">
          <h2 className="SportsHODName">{hod.name}</h2>
          <p className="text-brwn dark:text-drka text-[24px] mt-1">{hod.qualification}</p>
        </div>
        <h2 className="SportsHODDes text-brwn dark:text-drka mt-1 text-center">
          {hod.designation}
        </h2>
        <br />
        <p className="SportsHODmessage text-xl text-justify">
          {hod.message}
        </p>
      </div>
    </article>
  );
};

// ✅ Export both properly
export { Sportsfaculties, SportsHOD };
