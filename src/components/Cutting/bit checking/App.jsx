import { Route, Routes} from 'react-router-dom';
import BitChecking from './BitChecking';
import BitChart from './BitChart';
export default function App() {
  return (
    <Routes>
        <Route path='/' element={<BitChecking />} />
        <Route path='/bit-chart' element={<BitChart />} />
    </Routes>
  )
}