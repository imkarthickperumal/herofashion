import { Route, Routes} from 'react-router-dom';
import Sticker from './Sticker';
import StickerReport from './StickerReport';

export default function App() {
  return (
    <Routes>
        <Route path='/' element={<Sticker />} />
        <Route path='sticker-report' element={<StickerReport />} />
    </Routes>
  )
}