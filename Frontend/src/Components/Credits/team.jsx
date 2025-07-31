export default function TeamTol() {

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path :` ${BASE_URL}${path}`;
  };
  return (
<div className="flex justify-center mt-5">
  <div className="relative w-full h-[250px] md:h-[600px] rounded-xl overflow-hidden shadow-lg">
    <img
      src={UrlParser("/static/images/web_team/pilot_team.webp")}
      alt="Our Team"
      className="w-full h-full object-cover"
    />
    <div className="absolute bottom-0 w-full bg-black/60 text-white p-4 max-h-[40%] overflow-y-auto">
      <h2 className="text-2xl font-bold">Our Amazing Team</h2>
      <p className="mt-2 text-sm md:text-base leading-snug">
        We are the founding force behind Velammal Engineering College’s official website—the Pilot Batch of the VEC Web Development Team. As the first-ever team to take on this initiative, our 17-member squad laid the groundwork for the college’s digital presence using the MERN stack, GitHub collaboration, and AWS deployment. From full-stack architecture and responsive UI design to backend APIs, we built it all from scratch while working closely with college officials. Our legacy now continues with the Co-Pilot Batch, whom we’ve onboarded and mentored to maintain and evolve the platform. Our efforts laid a strong, scalable foundation for the batches to come.
      </p>
    </div>
  </div>
</div>
  );
}
