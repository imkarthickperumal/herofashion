import { Routes, Route } from "react-router-dom";
import Home from "./home";
import Machine_Allocation from "./machine_allocate"
import Unit_Allocate from "./unit_allocate";
import Machine_Transfer from "./Machine_Transfer";


function Machine_Allocate() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="machine_allocation" element={<Machine_Allocation />} />
      <Route path="unit_allocation" element={<Unit_Allocate />} />
      <Route path="machine_transfer" element={<Machine_Transfer />} />
    </Routes>
  );
}

export default Machine_Allocate;