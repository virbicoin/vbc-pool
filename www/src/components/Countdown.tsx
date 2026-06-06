"use client";

import { useState, useEffect } from "react";

type CountdownProps = {
  to: number;
};

const Countdown = ({ to }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = to - new Date().getTime();
      let newTimeLeft = "";

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));

        if (days > 0) {
          newTimeLeft = `in ${days} days ${hours} hours`;
        } else {
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          newTimeLeft = `in ${hours} hours ${minutes} minutes`;
        }
      } else {
        newTimeLeft = "Epoch passed";
      }

      setTimeLeft(newTimeLeft);
    };

    const timer = setInterval(calculateTimeLeft, 1000 * 60); // Update every minute
    calculateTimeLeft(); // Initial call

    return () => clearInterval(timer);
  }, [to]);

  return <>{timeLeft}</>;
};

export default Countdown;
