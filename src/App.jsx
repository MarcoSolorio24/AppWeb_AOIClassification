import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AoiPage from './pages/aoi/AoiPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AoiPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}