import React, { useEffect, useState } from "react";

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

const data1 = [
  {
    title: "MSME IDEA HACKATHON 5.0",
    stats: [{ number: 223, label: "Received Ideas", color: "bg-blue-700" }],
  },
  {
    title: "MSME IDEA HACKATHON 4.0",
    stats: [
      { number: 78, label: "Received Ideas", color: "bg-blue-600" },
      { number: 38, label: "Forwarded Ideas", color: "bg-green-600" },
      { number: 3, label: "Approved Ideas", color: "bg-green-700" },
    ],
  },
  {
    title: "MSME IDEA HACKATHON 3.0 (Women)",
    stats: [
      { number: 198, label: "Received Ideas", color: "bg-blue-500" },
      { number: 56, label: "Forwarded Ideas", color: "bg-green-600" },
      { number: 3, label: "Approved Ideas", color: "bg-green-700" },
    ],
  },
  {
    title: "IEDC",
    stats: [
        { number: 60, label: "2.84 c" ,color: "bg-blue-500" },
    ]
  }
];

const colors = ["bg-blue-700", "bg-green-600", "bg-green-700", "bg-purple-600"];

export default function Projects({data}) {
  return (
    <div className="min-h-screen bg-prim dark:bg-drkp p-6 font-[Poppins,sans-serif]">
        <div>
            <p className="text-4xl text-brwn dark:text-drkt p-2 text-center font-bold">Projects</p>
        </div>
      <div className="max-w-6xl mx-auto space-y-10">
        {data?.map((section, i) => (
          <div key={i} className="space-y-4">
            <h2 className="text-center text-lg font-bold">{section.title}</h2>
            <div className="flex flex-wrap justify-center gap-5">
              {section.stats.map((item, j) => {
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
  );
}

