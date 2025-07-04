import {useEffect, useRef, useState} from "react";

const Title = ({ttl}) => {
    const [tle, setTle] = useState(ttl)
    const ltrs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    function getTtl(num) {
        let tot = 0

        ttl.split("").map((ltr, ind) => {
            if(ind < num)
                tot += ltr.length + 1
        })
        console.log(tot)
        return tot
    }

    const hndlTtl = () => {
        let itr = 0

        const interval = setInterval(() => {
            setTle(ttl.split(" ")
                .map((wrd, xnd) => wrd.split("")
                .map((ltr, ind) => {
                    if(getTtl(xnd) + ind < itr)
                        return ttl.split(" ")[xnd][ind]
                    return ltrs[Math.floor(Math.random() * 26)]
                }).join("")).join(" "))

            if(itr >= ttl.length) clearInterval(interval)

            itr += 1/5
        }, 50)
    }

    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    useEffect(() => {
        hndlTtl()
    }, []);

    return (
        <h1 className="mt-14 z-10 ml-auto lg:ml-[45vw] text-4xl lg:text-5xl text-white font-tech"
            onMouseOver={hndlTtl}>{tle}</h1>
    )
}

export default Title;