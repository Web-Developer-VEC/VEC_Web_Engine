import LoadComp from "../../LoadComp";

const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };

const LIBHod = ({data}) => {
  if (!data) {
    return (
      <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
    );
  }

  return (
    <article className="flex flex-col gap-4 bg-prim dark:bg-drkp shadow-xl p-6 rounded-xl items-center text-center">
      <div className="w-full md:w-1/8 flex justify-center">
        <img
          className="w-auto h-60"
          alt="Library HoD"
          src={UrlParser(data.image_path)}
        />
      </div>

      <div className="flex flex-col px-4">
        <h2 className="text-2xl font-semibold">{data.name}</h2>
        <p className="text-lg text-accn dark:text-drka mb-2">{data.designation}</p>
        <p className="text-md mb-2 text-brwn dark:text-drka">{data.education_qualification}</p>
        <p className="text-xl sm:text-justify-center text-justify">{data.message}</p>
      </div>
    </article>
  );
};

export default LIBHod;
