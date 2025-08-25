import styles from "./Faculties.module.css";
import ImageCard from "./ImageCard";
import LoadComp from "../../../LoadComp";

const Faculties = ({ data }) => {

  if (!data || !Array.isArray(data)) {
    return <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
      <LoadComp />
  </div>
  }

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const hod_details = data?.find((item) => item.category === "head_of_department")?.members || [];
  const teaching_staff_details = data?.find((item) => item.category === "teaching_staff")?.members || [];
  const non_teaching_staff_details = data?.find((item) => item.category === "non_teaching_staff")?.members || [];
  const faculty_pdf_path = data?.find((item) => item.category === "faculty_pdf_path")?.content[0] || "";

  return (
    <div className={styles.app + " p-0 md:p-12"}>
      <div className={styles.imageGallery + " w-full"}>
          <div className={`${styles.fullWidthTile} relative`}>
            <ImageCard
              key={hod_details?.[0]?.unique_id || 0}
              name={hod_details?.[0]?.name}
              photo={hod_details?.[0]?.image_path}
              Designation={hod_details?.[0]?.designation}
              Scholar={hod_details?.[0]?.socialmedia_links?.googlescholar}
              Research={hod_details?.[0]?.socialmedia_links?.researchgate}
              Orchid={hod_details?.[0]?.socialmedia_links?.orchidprofile}
              Publon={hod_details?.[0]?.socialmedia_links?.publonprofile}
              Scopus={hod_details?.[0]?.socialmedia_links?.scopus}
              Linkedin={hod_details?.[0]?.socialmedia_links?.linkedin}
              firstTile={true}
              uid={hod_details?.[0]?.unique_id}
              faculty_Profile_pdf_path={hod_details?.[0]?.resume_pdf}
            />
            <div className="absolute bottom-[10px] top-[28%] -right-[10%] xl:top-[50%] xl:left-[70%] transform -translate-x-1/2 -translate-y-1/2">
              <button className="hover:bg-secd bg-accn hover:text-text text-prim px-2 py-2 rounded-md"  
              onClick={() => {
                  if (faculty_pdf_path && faculty_pdf_path.trim() !== "") {
                    const url = UrlParser(faculty_pdf_path);
                    if (url) {
                      window.open(url, "_blank", "noopener,noreferrer");
                    }
                  }
                }}
                >
                  Faculty List
                </button>
            </div>
          </div>
          {teaching_staff_details?.length > 0 && (
            <>
              <h2 className={`${styles.faculty} text-brwn dark:text-drkt`}>Faculty Members</h2>
              <div className={styles.gridContainer + ' grid grid-cols-2 md:grid-cols-4'}>
                {teaching_staff_details?.map((faculty, index) => (
                  <ImageCard
                    key={faculty?.unique_id || index}
                    name={faculty?.name}
                    photo={faculty?.image_path}
                    Designation={faculty?.designation}
                    Scholar={faculty?.socialmedia_links?.googlescholar}
                    Research={faculty?.socialmedia_links?.researchgate}
                    Orchid={faculty?.socialmedia_links?.orchidprofile}
                    Publon={faculty?.socialmedia_links?.publonprofile}
                    Scopus={faculty?.socialmedia_links?.scopus}
                    Linkedin={faculty?.socialmedia_links?.linkedin}
                    uid={faculty?.unique_id}
                    profile={faculty?.resume_pdf}
                  />
                ))}
              </div>
            </>
          )}
          {non_teaching_staff_details?.length > 0 && (
            <>
              <h2 className={`${styles.faculty} text-brwn dark:text-drkt`}>Non Teaching Staff</h2>
              <div className={`${styles.gridContainer} grid grid-cols-2 md:grid-cols-4 bg-black-100`}>
                {non_teaching_staff_details?.map((faculty, index) => (
                  <ImageCard
                    key={faculty?.unique_id || index}
                    name={faculty?.name}
                    photo={faculty?.image_path}
                    Designation={faculty?.designation}
                    Scholar={faculty?.socialmedia_links?.googlescholar}
                    Research={faculty?.socialmedia_links?.researchgate}
                    Orchid={faculty?.socialmedia_links?.orchidprofile}
                    Publon={faculty?.socialmedia_links?.publonprofile}
                    Scopus={faculty?.socialmedia_links?.scopus}
                    Linkedin={faculty?.socialmedia_links?.linkedin}
                    uid={faculty?.unique_id}
                    profile={faculty?.resume_pdf}
                  />
                ))}
              </div>       
            </>
          )}
      </div>
    </div>
  );
};

export default Faculties;
