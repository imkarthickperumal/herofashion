import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import BreakOverlay from "./BreakOverlay";
import { getActiveBreak } from "../utils/breakTime";

export default function GreyLayout() {
  const [activeBreak, setActiveBreak] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBreak(getActiveBreak());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {activeBreak && <BreakOverlay breakInfo={activeBreak} />}
      <Outlet />
    </>
  );
}
