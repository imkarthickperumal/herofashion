import { Routes, Route } from "react-router-dom";
import Home from "./home_1";
import Card1 from "./bit_report";
import Card2 from "./sticker_report";
import Card3 from "./lay";
import Card4 from "./roll";



function Quality_main() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="bit_report" element={<Card1 />} />
      <Route path="sticker_report" element={<Card2 />} />
      <Route path="lay" element={<Card3 />} />
      <Route path="roll" element={<Card4 />} />
     
    </Routes>
  );
}

export default Quality_main;