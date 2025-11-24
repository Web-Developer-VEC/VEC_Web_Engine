import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import LoadComp from './Components/Main/LoadComp';

const SharedLandingLayout = ({ components, theme, load, toggle, pageData, isOnline }) => {
    const {
        ImgSld,
        Abt,
        Announce,
        Event,
        Tracker,
        Samplereact,
        Contact,
        Footer,
        ScrollToTopButton
    } = components;

    const pageDetails = pageData?.find((item) => item.type === "page_details")?.data || [];
    const bannerData = pageData?.find((item) => item.type === "banner")?.data || [];
    const departmentBanner = pageData?.find((item) => item.type === "department_banner")?.data || [];
    const notifications = pageData?.find((item) => item.type === "notifications")?.data || [];
    const announcements = pageData?.find((item) => item.type === "announcements")?.data || [];
    const specialAnnouncements = pageData?.find((item) => item.type === "special_announcements")?.data || [];
    const events = pageData?.find((item) => item.type === "events")?.data || [];

    if (!isOnline) {
        return (
            <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
                <LoadComp txt={"You are offline"} />
            </div>
        );
    }

    return (
        <div className="landing-page -mt-[5vmax] overflow-x-hidden">
            <ImgSld
                load={load} toggle={toggle} theme={theme}
                lst={notifications}
                ph={pageDetails[0]?.phone_number}
                email={pageDetails[0]?.email}
            />
            <div className='w-max max-w-[100vw] h-fit absolute z-50'>
                <div className='pt-2 pb-[2vmax] bg-prim dark:bg-drkp'>
                    <Abt />
                    <Announce anno={announcements} spc={specialAnnouncements} />
                    <Event data={events} />
                </div>
                <Tracker data={bannerData} />
                <div className='bg-prim dark:bg-drkp'>
                    <Samplereact courses={departmentBanner} />
                    <Contact data={pageDetails?.[0]} />
                    {/* <Chat/> */}
                    <Footer theme={theme} data={pageDetails[0]} />
                </div>
            </div>
            <ScrollToTopButton />
        </div>
    );
};

export default SharedLandingLayout;
