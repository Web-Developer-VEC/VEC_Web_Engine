import Boot from "../Landing Comp/BootUp";
import Team from "./Crdt_Team";
import {useCallback, useRef} from "react";
import PointWaves from "./Crdt_Points";
import {Canvas} from "@react-three/fiber";
import Crdt_Title from "./Crdt_Title";
import {useParams} from "react-router-dom";


const Crdt = () => {
    const { ind } = useParams()
    let sld = useRef(0)

    const callSld = useCallback((val) => {
        sld.current = val
        // console.log(sld)
    }, [])

    return (
        <main className="relative bg-slate-800 h-[100vh] lg:h-[90vh] w-full overflow-x-hidden"
              style={{
                  backgroundColor: '#1B1B1B',
                  backgroundImage: 'linear-gradient(315deg, #1B1B1B 0%, #003153 74%)'
              }}>
            {/*<Boot isAuth={true} isLoaded={true} theme={"light"}/>*/}
            <Canvas className={"absolute top-0 h-max"} resize={{scroll: false}}
                    camera={{fov: 75, position: [0, 0, 10]}}>
                <PointWaves count={2000} speed={0.25} amplitude={30} waveLength={10}/>
            </Canvas>
            <div className="absolute top-[2vh]">
                <Crdt_Title ttl={"MEET THE TEAM"} />
                <Team ani={true} callSld={callSld} ind={+(ind)}/>
            </div>
        </main>
    )
}

export default Crdt