import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import RoleSelect from './pages/RoleSelect'
import ChatRoom from './pages/ChatRoom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/select" element={<RoleSelect />} />
      <Route path="/chat" element={<ChatRoom />} />
    </Routes>
  )
}
