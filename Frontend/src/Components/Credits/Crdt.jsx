import Boot from "../Landing Comp/BootUp";
import Team from "./Crdt_Team";
import {useCallback, useRef} from "react";
import PointWaves from "./Crdt_Points";
import {Canvas} from "@react-three/fiber";
import Crdt_Title from "./Crdt_Title";
import {useParams} from "react-router-dom";
import NotFound from "../../NotFound";
import TeamTol from "./team";


const Crdt = () => {
    const { ind } = useParams()
    let sld = useRef(0)
    const urlPrm = 18 // => /credits/[urlPrm]


    const callSld = useCallback((val) => {
        sld.current = val
        // console.log(sld)
    }, [])

    return (
        (ind <= urlPrm) ?
        <main className="relative bg-slate-800 w-full overflow-x- overflow-y-none"
              style={{
                  backgroundColor: '#1B1B1B',
                  backgroundImage: 'linear-gradient(315deg, #1B1B1B 0%, #003153 74%)'
              }}>
            {/*<Boot isAuth={true} isLoaded={true} theme={"light"}/>*/}
            <Canvas className={"absolute top-0 h-max"} resize={{scroll: false}}
                    camera={{fov: 75, position: [0, 0, 10]}}>
                <PointWaves count={2000} speed={0.25} amplitude={30} waveLength={10}/>
            </Canvas>
            <div className="relative w-full top-[2vh]">
              <TeamTol />
            </div>
            <div className="relative top-[0.1vh] h-full">
                <Crdt_Title ttl={"MEET THE TEAM"} />
                <Team ani={true} callSld={callSld} ind={+(ind)} urlPrm={urlPrm} />
            </div>
        </main> : <NotFound />
    )
}

export default Crdt