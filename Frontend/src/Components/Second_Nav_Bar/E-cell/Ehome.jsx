export default function Home () {
    return(
        <div className="ic-home-container">
                <div className="ic-about-section dark:bg-drkb border-l-4 border-secd dark:border-drks">
                    <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">About Us</h3>
                    <p className="ic-centered-text text-text dark:text-drkt">
                        LemonIvy started in 2008 to nurture spirit of entrepreneurship among fellow students. Velammal Engineering College is one of the 500 member institutions of the National Entrepreneurship Network (NEN-supported by Wadhwani Foundation) across the country. LemonIvy aims at making the student members aware of the different start-up terminologies and also give them the confidence to start their own business venture with the available resources. With the same kind of spark, zeal and out-of-the box thinking to go a long way in spreading the spirit of entrepreneurship.
                    </p>
                </div>

                <div className="ic-vision-mission-grid">
                    <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Our Vision</h3>
                        <p>To train our members, so as to face the challenges provided by the real world by exposing them to real world problems and also give them theoretical background and to inspire them to attain their dreams.</p>
                    </div>

                    <div className="ic-vm-card dark:bg-drkb border-l-4 border-secd dark:border-drks">
                        <h3 className="text-brwn dark:text-drkt border-b-2 border-secd dark:border-drks pb-1">Our Mission</h3>
                        <p>To make each and every member achieve his entrepreneurial dreams by providing</p>
                        <ul>
                            <li>A platform for expressing their views</li>
                            <li>An  atmosphere where idea generation is made possible</li>
                            <li>An interaction with the real world to get overall exposure.</li>
                            
                        </ul>
                    </div>
                </div>
            </div>
    )
}