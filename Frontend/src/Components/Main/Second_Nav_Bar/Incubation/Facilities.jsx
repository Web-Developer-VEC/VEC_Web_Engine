import LoadComp from "../../LoadComp";

function FacilityCard({ image, name, desc }) {
     const BASE_URL = process.env.REACT_APP_BASE_URL;

    const UrlParser = (path) => {
        return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
    };
  return (
    <div className="bg-prim dark:bg-black rounded-lg shadow hover:shadow-lg overflow-hidden transition-shadow">
      <img src={UrlParser(image)} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg text-center font-semibold mb-2 text-text dark:text-drkt">{name}</h3>
      </div>
    </div>
  );
}

export default function facilities({data}) {
  // Example facility data (you can fetch from API)
  return (
    <>
      {data ? (
        <div className="bg-prim dark:bg-drkp min-h-screen font-[Poppins,sans-serif]">
          <section className="max-w-6xl mx-auto py-10 px-4">
            <h2 className="text-2xl font-bold text-brwn dark:text-drkt mb-6 text-center">Explore Facilities</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((f, idx) => (
                <FacilityCard key={idx} {...f} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
}
