import { Route, Routes} from 'react-router-dom';
import GreyLayout from '../components/GreyLayout'
import EntryPage from '../pages/EntryPage';
import Machine from '../pages/Machine'
import Checking from '../pages/Checking'
import RollChecking from '../pages/RollChecking'
import MachineReport from '../pages/MachineReport'
import CostReport from '../pages/CostReport'

export default function App() {

  return (
    <Routes>
    <Route path='/' element={<GreyLayout />}>
        <Route index element={<EntryPage />} />
        <Route path="/machine/:id" element={<Machine />} />
        <Route path="/machine/:id/checking" element={<Checking />} />
        <Route path="/machine/:id/details" element={<RollChecking />} />
        <Route path="/machine/:id/report" element={<MachineReport />} />
        <Route path="/report" element={<MachineReport />} />
        {/* <Route path="/report/costreport" element={<CostReport />} /> */}
    </Route>
    </Routes>
  )
}