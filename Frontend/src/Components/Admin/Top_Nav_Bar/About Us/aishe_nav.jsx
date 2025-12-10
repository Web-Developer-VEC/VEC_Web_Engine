import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { ArrowBigLeft } from "lucide-react";

// ICONS MAPPING FUNCTION (only for years, else fallback)
function setIco(ttl) {
    // For demonstration, you may want different icons for years
    return null;
}

const AisheSideNav = ({
    sts,
    setSts,
    navData,
    backButton = false,
    sidNavEdit = false,
    openModel,
    onDeleteYear // <-- add this prop for delete
}) => {
    const navigate = useNavigate();

    return (
        <div className="grid w-screen grid-cols-10 -mt-10 md:-mt-4 lg:-mt-2 *:px-2">
            <nav className="bg-black pt-4 pb-12 flex gap-y-2 gap-x-2 flex-wrap
                lg:grid text-md h-full content-start col-start-0 col-span-10 lg:col-span-2
                transition-all duration-300 ease-in-out">
                <div className="flex justify-between">
                    {backButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 m-2 text-prim hover:text-text rounded hover:bg-secd transition-colors w-fit flex"
                        >
                            <ArrowBigLeft/> Back
                        </button>
                    )}
                    {sidNavEdit && (
                        <button className=" mt-2 bg-secd px-1 h-8 rounded-full" onClick={openModel}>
                            <Plus  size={25}/>
                        </button>
                    )}
                </div>
                {/* Render year buttons */}
                {Object.keys(navData).map((year, idx) => (
                    <div
                        key={year}
                        className={`flex items-center justify-between px-4 py-2 border-secd min-w-1/2
                            text-prim hover:bg-secd hover:text-text rounded-lg
                            transition-all duration-300 ease-in-out
                            ${sts === year ? "bg-secd text-text font-semibold" : ""}
                        `}
                    >
                        <button
                            className="flex-1 text-start bg-transparent border-none outline-none"
                            type="button"
                            onClick={() => setSts(year)}
                        >
                            {setIco(year)}{year}
                        </button>
                        {sidNavEdit && (
                            <button
                                className="ml-2 p-2 text-red-500 hover:text-red-600 rounded-full"
                                title="Delete Year"
                                onClick={() => onDeleteYear(year)}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </nav>
            <div className="col-span-10 lg:col-span-8 overflow-hidden">
                {navData[sts]}
            </div>
        </div>
    );
};

export default AisheSideNav;