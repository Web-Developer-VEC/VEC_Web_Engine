import React, { useEffect, useState } from "react";
import LoadComp from "../../LoadComp";

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

export function StatCard({ number, label, color }) {
  const count = useCountUp(number); 

  return (
    <div
      className={`${color} text-white rounded shadow-lg w-52 h-32 flex flex-col justify-center items-center`}
    >
      <div className="text-4xl font-bold">{count}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
}

const colors = ["bg-blue-700", "bg-green-600", "bg-green-700", "bg-purple-600"];

export default function Projects({data}) {
  if (!Array.isArray(data)) {
    return (
      <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
        <LoadComp />
      </div>
    );
  }
  return (
    <>
      {data ? (
      <div className="min-h-screen bg-prim dark:bg-drkp p-6 font-[Poppins,sans-serif]">
          <div>
              <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Projects</p>
          </div>
        <div className="max-w-6xl mx-auto space-y-10">
          {data?.map((section, i) => (
            <div key={i} className="space-y-4">
              <h2 className="text-center text-lg font-bold">{section?.title}</h2>
              <div className="flex flex-wrap justify-center gap-5">
                {section?.stats?.map((item, j) => {
                  const color = colors[j % colors.length];
                  return (
                    <StatCard
                      key={j}
                      number={item.number}
                      label={item.label}
                      color={color}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      ) : (
        <div className={"h-screen flex items-center justify-center md:mt-[15%] md:block"}>
          <LoadComp />
        </div>
      )}
    </>
  );
}

