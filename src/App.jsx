import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Play from './pages/Play'
import LoginPage from './pages/LoginPage'
import Results from './pages/Results'

export default function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/play" element={<Play />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  )
}
