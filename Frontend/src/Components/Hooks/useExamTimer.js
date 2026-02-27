import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function useExamTimer(onTimeUp) {
  const [remaining, setRemaining] = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    let syncInterval;
    let localInterval;

    const syncTime = async () => {
      try {
        const res = await axios.get("/api/main-backend/qa/session/time");

        // ✅ backend authoritative value
        setRemaining(res.data.remainingSeconds);
        initialized.current = true;
      } catch (err) {
        const status = err.response?.data?.status;

        // ❌ ignore until first valid sync
        if (!initialized.current) return;

        // ✅ ONLY real time-up
        if (status === "TIME_UP") {
          onTimeUp({ status: "TIME_UP" });
        }
      }
    };

    syncTime();
    syncInterval = setInterval(syncTime, 5000);

    localInterval = setInterval(() => {
      setRemaining(prev => {
        if (prev === null) return prev;
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(localInterval);
    };
  }, []);

  return remaining;
}