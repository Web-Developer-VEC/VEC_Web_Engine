import Boot from "../Landing Comp/BootUp";
import Team from "./Crdt_Team";
import {useCallback, useRef} from "react";
import Crdt_Title from "./Crdt_Title";
import TeamTol from "./team";


const Crdt = () => {
    let sld = useRef(0)
    const callSld = useCallback((val) => {
        sld.current = val
    }, [])

    return (
        <main className="bg-slate-800 w-full overflow-x-hidden overflow-y-none"
              style={{
                  backgroundColor: '#1B1B1B',
                  backgroundImage: 'linear-gradient(315deg, #1B1B1B 0%, #003153 74%)'
              }}>
            <div className="">
              <TeamTol />
            </div>
            <div className="">
                <Crdt_Title ttl={"MEET THE TEAM"} />
                <div className="mt-[30px]">
                    <Team ani={true} callSld={callSld} />
                </div>
            </div>
        </main>
    )
}

export default Crdt